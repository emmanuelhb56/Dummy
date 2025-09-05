// src/services/chatbot.ts
import { fetchJsonWithRetry } from "@/services/utils/fetchJson";
import type { KBEntry, ConversationData, Message, ContactData } from "@/types/chatwoot";
import { log } from "../utils/logging";
import {
  ACCOUNT_ID,
  BOT_TOKEN,
  CHATWOOT_URL,
  PERMANENT_TAGS,
  PERSONAL_TOKEN,
  TEMP_NORMAL_TAGS,
  TEMP_SEMI_PERMANENT_TAGS
} from "../utils/kb-clickbalance";

// ----------------- Locks y cooldown -----------------
const conversationLocks: Record<number, boolean> = {};
const MESSAGE_COOLDOWN = 1000; // 1 segundo

const responseLocks: Record<string, boolean> = {};

// ----------------- Normalización y KB -----------------
export function normalize(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function precomputeTriggers(kb: KBEntry[]): Map<string, KBEntry> {
  const map = new Map<string, KBEntry>();
  for (const entry of kb) {
    entry.triggers?.forEach(t => map.set(normalize(t), entry));
  }
  return map;
}

export function findKBEntry(text: string, kb: KBEntry[]): KBEntry | null {
  const ntext = normalize(text);
  for (const entry of kb) {
    if (entry.triggers?.some(t => ntext.includes(normalize(t)))) return entry;
    if (entry.patterns?.some(p => new RegExp(p, "i").test(text))) return entry;
  }
  return null;
}

export function shouldUseGPT(userText: string, kb: KBEntry[]): boolean {
  return findKBEntry(userText, kb) === null;
}

// ----------------- Envío de mensajes -----------------
export async function sendBotReply(conversationId: number, content: string) {
  try {
    const response = await fetchJsonWithRetry(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: BOT_TOKEN },
        body: JSON.stringify({ content, message_type: "outgoing" }),
      }
    );
    log("info", `Mensaje enviado a conversación ${conversationId}: ${content}`);
    return response;
  } catch (err) {
    log("error", `Error enviando mensaje a conversación ${conversationId}`, err);
  }
}

export async function sendBotReplySafe(conversationId: number, content: string) {
  if (conversationLocks[conversationId]) {
    log("info", `Lock activo en conversación ${conversationId}, mensaje ignorado`);
    return;
  }

  conversationLocks[conversationId] = true;
  try {
    await sendBotReply(conversationId, content);
  } finally {
    setTimeout(() => {
      conversationLocks[conversationId] = false;
      log("info", `Lock liberado en conversación ${conversationId}`);
    }, MESSAGE_COOLDOWN);
  }
}

// ----------------- KB Responses -----------------
export function canRespond(conversationKey: string, entry: KBEntry, cooldown = 3000): boolean {
  const lockKey = `${conversationKey}_${entry.id}`;
  if (responseLocks[lockKey]) return false;
  responseLocks[lockKey] = true;
  setTimeout(() => delete responseLocks[lockKey], cooldown);
  return true;
}

export async function sendKBEntry(conversationId: number, entry: KBEntry) {
  if (!canRespond(conversationId.toString(), entry)) return;

  let text = entry.response || "";
  if (entry.followups?.length) {
    text += "\n\nSiguientes pasos:\n" + entry.followups.map(f => `• ${f}`).join("\n");
  }

  await sendBotReplySafe(conversationId, text);

  if (entry.actions?.addTags?.length || entry.tags?.length) {
    await addTagsSafely(conversationId, entry.actions?.addTags || entry.tags || []);
  }

  if (entry.actions?.assignTeamId) {
    await assignTeamIfNeeded(conversationId, entry.actions.assignTeamId);
  }

  if (entry.actions?.priority) {
    await setPriorityIfNeeded(conversationId, entry.actions.priority);
  }

  log("info", `KBEntry enviado: ${entry.id} a conversación ${conversationId}`);
}

// ----------------- Etiquetas -----------------
export async function getConversationLabels(conversationId: number): Promise<string[]> {
  try {
    const data = await fetchJsonWithRetry<{ payload?: { title: string }[] }>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    return data.payload?.map(l => l.title).filter(Boolean) || [];
  } catch (err) {
    log("error", `Error obteniendo etiquetas de conversación ${conversationId}`, err);
    return [];
  }
}

export async function addTagsSafely(conversationId: number, tags: string[]) {
  try {
    // Obtener etiquetas actuales
    const existing = await getConversationLabels(conversationId);

    // Separar tags a remover y tags a agregar
    const toRemove = tags.filter(t => t.startsWith("__remove__")).map(t => t.replace("__remove__", ""));
    const toAdd = tags.filter(t => !t.startsWith("__remove__"));

    // 🔹 Construir set final
    const finalTags = Array.from(
      new Set([
        ...existing.filter(l => PERMANENT_TAGS.includes(l) || TEMP_SEMI_PERMANENT_TAGS.includes(l) || (TEMP_NORMAL_TAGS.includes(l) && !toRemove.includes(l))),
        ...toAdd, // TEMP_TAGS o cualquier tag nuevo agregado explícitamente
      ])
    );

    if (finalTags.length) {
      await fetchJsonWithRetry(
        `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
          body: JSON.stringify({ labels: finalTags }),
        }
      );
      log("info", `Etiquetas actualizadas para conversación ${conversationId}: ${finalTags}`);
    }
  } catch (err) {
    log("error", `Error en addTagsSafely conversación ${conversationId}`, err);
  }
}

// ----------------- Asignación de equipo y prioridad -----------------
export async function assignTeamIfNeeded(conversationId: number, teamId: number) {
  if (!teamId) return;
  try {
    const conv = await fetchJsonWithRetry<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    if (!conv.team?.id) {
      await fetchJsonWithRetry(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
        body: JSON.stringify({ team_id: teamId }),
      });
      log("info", `Conversación ${conversationId} asignada al equipo ${teamId}`);
    }
  } catch (err) {
    log("error", `Error asignando equipo en conversación ${conversationId}`, err);
  }
}

export async function setPriorityIfNeeded(conversationId: number, priority: "low" | "medium" | "high") {
  try {
    await fetchJsonWithRetry(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ priority }),
    });
    log("info", `Prioridad establecida a '${priority}' en conversación ${conversationId}`);
  } catch (err) {
    log("error", `Error estableciendo prioridad en conversación ${conversationId}`, err);
  }
}

// ----------------- Contacto -----------------
export async function updateContactFromConversation(conversationId: number, contactData: Partial<ContactData>) {
  if (!contactData || Object.keys(contactData).length === 0) return;

  try {
    await fetchJsonWithRetry(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/contact`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify(contactData),
    });
    log("info", `Contacto actualizado en conversación ${conversationId}`, contactData);
  } catch (err) {
    log("error", `Error actualizando contacto en conversación ${conversationId}`, err);
  }
}

export async function getContactIdFromConversation(conversationId: number) {
  try {
    const data = await fetchJsonWithRetry<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    return data.meta?.sender?.id;
  } catch (err) {
    log("error", `Error obteniendo contacto de conversación ${conversationId}`, err);
    return undefined;
  }
}

export async function closeConversation(conversationId: number) {
  try {
    await fetchJsonWithRetry(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ status: "resolved" }),
    });
    log("info", `Conversación ${conversationId} cerrada ✅`);
  } catch (err) {
    log("error", `Error cerrando conversación ${conversationId} ❌`, err);
  }
}
