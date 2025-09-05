// src/services/chatbot.ts
import { fetchJson } from "@/services/utils/fetchJson";
import type { KBEntry, ConversationData, Message, ContactData } from "@/types/chatwoot";
import { log } from "../utils/logging";
import { ACCOUNT_ID, BOT_TOKEN, CHATWOOT_URL, PERMANENT_TAGS, PERSONAL_TOKEN, TEMP_NORMAL_TAGS, TEMP_SEMI_PERMANENT_TAGS, TEMP_TAGS } from "../utils/kb-clickbalance";

const MESSAGE_COOLDOWN = 2000;
const conversationLocks: Record<number, boolean> = {};
const responseLocks: Record<string, boolean> = {}; // para canRespond

// ----------------- Normalización y KB -----------------
export function normalize(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

// ----------------- Mensajes -----------------
export async function sendBotReply(conversationId: number, content: string) {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", api_access_token: BOT_TOKEN },
      body: JSON.stringify({ content, message_type: "outgoing" })
    });
    log("info", `Mensaje enviado en conversación ${conversationId} ✅: ${content}`);
  } catch (err) {
    log("error", `Error enviando mensaje en conversación ${conversationId} ❌`, err);
  }
}

export async function sendBotReplySafe(conversationId: number, content: string) {
  if (conversationLocks[conversationId]) return;
  conversationLocks[conversationId] = true;

  try {
    await sendBotReply(conversationId, content);
  } finally {
    setTimeout(() => {
      conversationLocks[conversationId] = false;
    }, MESSAGE_COOLDOWN);
  }
}

// ----------------- Conversaciones -----------------
export async function getConversationMessages(conversationId: number) {
  const data = await fetchJson<{ payload: Message[] }>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages?before=<timestamp>&limit=10`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );
  return data.payload;
}

export async function closeConversation(conversationId: number) {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ status: "resolved" })
    });
    log("info", `Conversación ${conversationId} cerrada ✅`);
  } catch (err) {
    log("error", `Error cerrando conversación ${conversationId} ❌`, err);
  }
}

// ----------------- Etiquetas -----------------
export async function getConversationLabels(conversationId: number): Promise<string[]> {
  try {
    const data = await fetchJson<{ payload?: { title: string }[] }>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    return (data.payload?.map(l => l.title).filter(Boolean)) || [];
  } catch (err) {
    log("error", "❌ Error obteniendo etiquetas:", err);
    return [];
  }
}

export async function addTagsSafely(conversationId: number, tags: string[]) {
  try {
    const existingLabels = await getConversationLabels(conversationId);

    const toRemove = tags
      .filter(t => t.startsWith("__remove__"))
      .map(t => t.replace("__remove__", ""));
    const toAdd = tags.filter(t => !t.startsWith("__remove__"));

    const PERMANENT = new Set(PERMANENT_TAGS);
    const SEMI = new Set(TEMP_SEMI_PERMANENT_TAGS);
    const NORMAL = new Set(TEMP_NORMAL_TAGS);
    const TEMP = new Set(TEMP_TAGS);

    // 🔹 Eliminar etiquetas explícitas (excepto permanentes o semi-permanentes)
    for (const tag of toRemove) {
      if (existingLabels.includes(tag) && !PERMANENT.has(tag) && !SEMI.has(tag)) {
        await fetchJson(
          `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              api_access_token: PERSONAL_TOKEN,
            },
            body: JSON.stringify({ labels: [tag] }),
          }
        );
        log(
          "info",
          `Etiqueta '${tag}' eliminada de conversación ${conversationId} 🗑️`
        );
      }
    }

    // 🔹 Construcción del set final
    const cleaned = existingLabels.filter(
      l =>
        // Mantener permanentes y semi siempre
        PERMANENT.has(l) ||
        SEMI.has(l) ||
        // Mantener normales salvo que estén en toRemove
        (NORMAL.has(l) && !toRemove.includes(l))
      // ❌ TEMP nunca se conserva automáticamente (se limpian en cada vuelta)
    );

    const combined = Array.from(
      new Set([
        ...cleaned,
        // TEMP solo persiste si se agrega explícitamente en este turno
        ...toAdd.filter(Boolean),
      ])
    );

    // 🔹 Actualizar etiquetas finales
    await fetchJson(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_access_token: PERSONAL_TOKEN,
        },
        body: JSON.stringify({ labels: combined }),
      }
    );

    log(
      "info",
      `Etiquetas actualizadas para conversación ${conversationId} ✅: ${combined}`
    );
  } catch (err) {
    log("error", "Error en addTagsSafely ❌", err);
  }
}


// ----------------- Equipo y prioridad -----------------
export async function assignTeamIfNeeded(conversationId: number, teamId: number) {
  if (!teamId) return;

  try {
    const conversation = await fetchJson<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    if (!conversation.team?.id) {
      await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
        body: JSON.stringify({ team_id: teamId }),
      });
      log("info", `Conversación ${conversationId} asignada al equipo ${teamId} ✅`);
    }
  } catch (err) {
    log("error", "Error asignando equipo ❌", err);
  }
}

export async function setPriorityIfNeeded(conversationId: number, priority: "low" | "medium" | "high") {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ priority })
    });
    log("info", `Prioridad de conversación ${conversationId} establecida a '${priority}' ✅`);
  } catch (err) {
    log("error", "Error estableciendo prioridad ❌", err);
  }
}

// ----------------- Helper KB -----------------
export function canRespond(conversationKey: string, entry: KBEntry): boolean {
  const lockKey = `${conversationKey}_${entry.id}`;
  if (responseLocks[lockKey]) return false;
  responseLocks[lockKey] = true;
  setTimeout(() => { delete responseLocks[lockKey]; }, 3000); // evita respuestas duplicadas rápidas
  return true;
}

export async function sendKBEntry(conversationId: number, entry: KBEntry) {
  if (!canRespond(conversationId.toString(), entry)) return;

  let text = entry.response || "";
  if (entry.followups?.length) {
    text += "\n\nSiguientes pasos:\n" + entry.followups.map(f => `• ${f}`).join("\n");
  }

  await sendBotReplySafe(conversationId, text);

  const tagsToAdd = entry.actions?.addTags?.length
    ? entry.actions.addTags
    : entry.tags || [];
  if (tagsToAdd.length > 0) {
    await addTagsSafely(conversationId, tagsToAdd);
  }

  if (entry.actions?.assignTeamId) {
    await assignTeamIfNeeded(conversationId, entry.actions.assignTeamId);
  }

  if (entry.actions?.priority) {
    await setPriorityIfNeeded(conversationId, entry.actions.priority);
  }
}

// ----------------- Contacto -----------------
export async function updateContactFromConversation(
  conversationId: number,
  contactData: Partial<ContactData>
) {
  try {
    await fetchJson(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/contact`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          api_access_token: PERSONAL_TOKEN,
        },
        body: JSON.stringify(contactData),
      }
    );
    log("info", `✅ Contacto actualizado en conversación ${conversationId}`, contactData);
  } catch (err) {
    log("error", `❌ Error actualizando contacto en conversación ${conversationId}:`, err);
  }
}

export async function getContactIdFromConversation(conversationId: number) {
  const data = await fetchJson<ConversationData>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );
  return data.meta?.sender?.id;
}
