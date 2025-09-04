import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import { FLOW_RULES, KNOWLEDGE_BASE, BOT_TOKEN, BAD_WORDS, INBOX_MAP, PERMANENT_TAGS, GREETINGS, FAREWELLS, REOPENINGS, BAD_WORDS_RESPONSES, TEMP_SEMI_PERMANENT_TAGS } from "@/utils/chatbot-config";
import OpenAI from "openai";

const CHATWOOT_URL = process.env.CHATWOOT_URL || "https://app.chatwoot.com";
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID || "132018";
const PERSONAL_TOKEN = process.env.CHATWOOT_PERSONAL_TOKEN || "F2zAjGZ82fXq9Z1SVVWHDFGa";

let lastProcessedMessage: { conversationId: number; content: string; timestamp: number } | null = null;
const MESSAGE_COOLDOWN = 2000;
// Fuera de la función, en la parte superior del archivo
const conversationKbCache: Record<number, Record<string, number>> = {};


const BASE_TIMEOUT = 30000; // 30s base
const TIME_INCREMENT = 600000; // +10min por cada mensaje del usuario

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==================== TIPOS ====================
interface WebhookPayload {
  event: string;
  message_type?: string;
  content?: string;
  id?: number;
  conversation?: { id: number };
  meta?: { sender?: { id?: number; name?: string; email?: string } };
}

interface ConversationData {
  id: number;
  inbox_id: number;
  meta?: { 
    sender?: { id?: number };
    kb_counter?: Record<string, number>; // <--- aquí
  };
  priority?: "low" | "medium" | "high";
  status?: "open" | "resolved" | "pending" | "spam" | "ignored" | "blocked";
  team?: { id: number };
  team_id?: number;
  assignee?: { id: number };
}

interface ContactData {
  id?: number;
  name?: string;
  email?: string;
  phone_number?: string;
  payload?: Record<string, unknown>;
}

interface Message {
  content: string;
  message_type: "incoming" | "outgoing" | "note";
  tags: string[];
}

// ==================== HELPERS ====================
async function fetchJson<T>(url: string, options?: RequestInit, retries = 3, backoff = 500): Promise<T> {
  try {
    const res = await fetch(url, options as import("node-fetch").RequestInit);
    if (!res.ok) {
      const text = await res.text();
      if (retries > 0 && [429, 500, 502, 503, 504].includes(res.status)) {
        console.warn(`⚠️ Error ${res.status} en ${url}, reintentando en ${backoff}ms...`);
        await new Promise(r => setTimeout(r, backoff));
        return fetchJson<T>(url, options, retries - 1, backoff * 2);
      }
      throw new Error(`HTTP error ${res.status} en ${url}: ${text}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (retries > 0) {
      log("warn", `⚠️ Fetch falló, reintentando en ${backoff}ms...`, err);
      await new Promise(r => setTimeout(r, backoff));
      return fetchJson<T>(url, options, retries - 1, backoff * 2);
    }
    log("error", `❌ Fetch definitivo falló en ${url}:`, err);
    throw err;
  }
}

// ==================== HELPER RANDOM ====================
function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== POST WEBHOOK ====================
export async function POST(req: NextRequest) {
  try {
    const body: WebhookPayload = await req.json();
    const event = body.event;

    switch (event) {
      case "conversation_created":
        await handleConversationCreated(body);
        break;
      case "message_created":
        if (body.message_type === "incoming") await handleMessageCreated(body);
        break;
      case "conversation_updated":
        await handleConversationUpdated(body);
        break;
      default:
        console.log(`Evento '${event}' no manejado`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    log("error", "❌ Error webhook:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

// ==================== HANDLERS ====================
// ==================== HANDLERS ====================
async function handleConversationCreated(payload: WebhookPayload) {
  const sender = payload.meta?.sender;
  const contactId = sender?.id ?? await createOrUpdateContact(sender?.name || "Cliente desconocido", sender?.email || undefined);
  if (!contactId) return;

  const conversationId = payload.id ?? await createConversation(contactId, INBOX_MAP.principal);
  if (!conversationId) return;

  // ✅ Agregar etiquetas de bienvenida
  await safeAddTags(conversationId, ["auto_bienvenida", "kb_bienvenida"]);

  // ✅ Enviar mensaje de bienvenida solo si no se ha enviado antes
  const messages = await getConversationMessages(conversationId);
  const alreadyWelcomed = messages.some(m =>
    m.message_type === "outgoing" &&
    ["auto_bienvenida", "kb_bienvenida"].some(tag => m.tags?.includes(tag))
  );

  if (!alreadyWelcomed) {
    await sendBotReply(conversationId, getRandom(GREETINGS));
    log("info", `📩 Mensaje de bienvenida enviado en conversación ${conversationId}`);
  }

  // Manejar lead tags (teléfono, etc.)
  const newTags: string[] = [];
  const leadTags = await handleLeadTags(conversationId, contactId);
  newTags.push(...leadTags.tags);
  if (newTags.length) await addTagsSafely(conversationId, newTags);

  // Asignación de equipo y prioridad
  const inboxKey = getInboxKeyById(INBOX_MAP.principal) as keyof typeof FLOW_RULES | undefined;
  const flowRule = inboxKey ? FLOW_RULES[inboxKey] : undefined;

  if (flowRule?.assignTeamId) await assignTeamIfNeeded(conversationId, flowRule.assignTeamId);
  if (flowRule?.priority) await setPriorityIfNeeded(conversationId, flowRule.priority);

  log("info", `✅ Conversación ${conversationId} creada; mensaje de bienvenida enviado si era necesario`);
}

// ==================== GPT INTEGRATION ====================
async function generateGPTReply(
  text: string,
  contactHasPhone: boolean,
  conversationId?: number
): Promise<string | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente de atención al cliente." },
        { role: "user", content: text },
        { role: "system", content: contactHasPhone ? "El usuario tiene un número de teléfono." : "El usuario no tiene un número de teléfono." }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("GPT respondió vacío");

    return content;

  } catch (err) {
    console.error("❌ Error GPT:", err);

    if (conversationId) {
      // Etiqueta para seguimiento humano
      await addTagsSafely(conversationId, ["error_gpt"]);

      // Mensaje alternativo al usuario
      await sendBotReply(
        conversationId,
        "⚠️ Nuestro asistente AI no puede responder en este momento. Un agente humano te atenderá pronto."
      );
    }

    return null;
  }
}

const autoCloseSent: Record<number, boolean> = {};
const autoCloseTimers: Record<number, NodeJS.Timeout> = {};

// ==================== AUTO-CLOSE ====================
function scheduleAutoClose(conversationId: number, userMessageCount = 0) {
  if (autoCloseSent[conversationId]) return;
  if (autoCloseTimers[conversationId]) return;

  const timeout = BASE_TIMEOUT + TIME_INCREMENT * userMessageCount;
  log("info", `⏳ scheduleAutoClose llamado para conversación ${conversationId}, timeout = ${timeout}ms`);

  autoCloseTimers[conversationId] = setTimeout(async () => {
    try {
      if (autoCloseSent[conversationId]) return;

      const conversationData = await fetchJson<ConversationData>(
        `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
        { headers: { api_access_token: PERSONAL_TOKEN } }
      );

      if (conversationData.status !== "open") return;

      await safeAddTags(conversationId, ["no_respuesta"]);
      await sendBotReply(conversationId, getRandom(FAREWELLS));
      await closeConversation(conversationId);

      autoCloseSent[conversationId] = true;
      log("info", `✅ Conversación ${conversationId} cerrada automáticamente por inactividad`);
    } catch (err) {
      log("error", "❌ Error en autoClose:", err);
    } finally {
      delete autoCloseTimers[conversationId];
    }
  }, timeout);
}

// ==================== MESSAGE CREATED ====================
async function handleMessageCreated(payload: WebhookPayload) {
  const conversationId = payload.conversation?.id;
  const text = payload.content?.trim();
  if (!conversationId || !text) return;

  const now = Date.now();
  const normalize = (str: string) => str?.replace(/\s+/g, " ").trim() || "";

  // Evitar mensajes duplicados en corto tiempo
  if (
    lastProcessedMessage &&
    lastProcessedMessage.conversationId === conversationId &&
    normalize(lastProcessedMessage.content) === normalize(text) &&
    now - lastProcessedMessage.timestamp < MESSAGE_COOLDOWN
  ) return;

  lastProcessedMessage = { conversationId, content: text, timestamp: now };

  const conversationData = await fetchJson<ConversationData>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );

  // 🔹 Reabrir conversación si estaba resuelta
  if (conversationData.status === "resolved") {
    await reopenConversation(conversationId);
    await sendBotReply(conversationId, getRandom(REOPENINGS));
  }

  const inboxKey = getInboxKeyById(conversationData.inbox_id) as keyof typeof FLOW_RULES | undefined;
  const existingLabels = await getConversationLabels(conversationId);

  // 🔹 Obtener datos de contacto
  const contactId = await getContactIdFromConversation(conversationId);
  let contactHasPhone = false;
  if (contactId) {
    const contactData = await fetchJson<ContactData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    contactHasPhone = !!contactData.phone_number;
  }

  const newTags: string[] = [];
  if (contactId) {
    const leadTags = await handleLeadTags(conversationId, contactId);
    newTags.push(...leadTags.tags);
  }

  let reply: string | null = null;

  // ===========================
  // ENVÍO DE MENSAJE DE BIENVENIDA
  // ===========================
  if (existingLabels.includes("auto_bienvenida")) {
    reply = getRandom(GREETINGS);
    // Remover la etiqueta para que no se repita
    await addTagsSafely(conversationId, ["__remove__auto_bienvenida"]);
    log("info", `📩 Enviando mensaje de bienvenida a conversación ${conversationId}`);
  }

  // ===========================
  // KB CON MAX RESPONSES
  // ===========================
  if (!conversationKbCache[conversationId]) {
    conversationKbCache[conversationId] ||= await loadKbCounter(conversationId) || {};
  }

  const kbMatch = KNOWLEDGE_BASE.find(kb =>
    text.toLowerCase().includes(kb.triggers.map(t => t.toLowerCase()).join("|"))
  );

  if (kbMatch) {
    const kbTag = (kbMatch.controlTag || kbMatch.triggers[0]).toLowerCase().trim();
    const kbCounter = conversationKbCache[conversationId];
    const count = kbCounter[kbTag] || 0;

    if (!kbMatch.maxResponses || count < kbMatch.maxResponses) {
      reply = reply || (typeof kbMatch.response === "function" ? kbMatch.response(contactHasPhone) : kbMatch.response);
      kbCounter[kbTag] = count + 1;
      conversationKbCache[conversationId] = kbCounter;
      await saveKbCounter(conversationId, kbCounter);

      if (kbMatch.controlTag && !existingLabels.includes(kbMatch.controlTag)) newTags.push(kbMatch.controlTag);
      if (kbMatch.tags?.length) newTags.push(...kbMatch.tags);
    } else {
      reply = reply || kbMatch.exceededResponse;
    }
  }

  // ===========================
  // DETECCIÓN DE TELÉFONO
  // ===========================
  const phoneResult = await handlePhoneDetection(conversationId, text, await getConversationMessages(conversationId));
  if (phoneResult.reply) reply = reply || phoneResult.reply;
  newTags.push(...phoneResult.tags);

  // ===========================
  // PALABRAS PROHIBIDAS
  // ===========================
  const detectedBadWord = BAD_WORDS.find(w => text.toLowerCase().includes(w.word));
  if (detectedBadWord) {
    const severityLevel: "leve" | "grave" = detectedBadWord.severity || "leve";
    const filteredResponses = BAD_WORDS_RESPONSES.filter(r => r.severity === severityLevel);
    reply = reply || getRandom(filteredResponses).response;
    newTags.push("cliente-grosero", "caso_especial");
  }

  // ===========================
  // RESPUESTA GPT POR DEFECTO
  // ===========================
  if (!reply) {
    reply = await generateGPTReply(text, contactHasPhone, conversationId);
  }

  // ===========================
  // COMBINAR TAGS Y APLICAR
  // ===========================
  const flowRule = inboxKey ? FLOW_RULES[inboxKey] : undefined;
  const flowTags = flowRule?.tags ?? [];
  const combinedTags = Array.from(
    new Set([...existingLabels.filter(l => PERMANENT_TAGS.includes(l)), ...newTags, ...flowTags])
  );
  await addTagsSafely(conversationId, combinedTags);

  // ===========================
  // ENVIAR RESPUESTA
  // ===========================
  if (reply) await sendBotReply(conversationId, reply);

  // ===========================
  // ASIGNAR EQUIPO Y PRIORIDAD
  // ===========================
  if (flowRule?.assignTeamId && !conversationData.team?.id) await assignTeamIfNeeded(conversationId, flowRule.assignTeamId);
  if (flowRule?.priority && !conversationData.priority) await setPriorityIfNeeded(conversationId, flowRule.priority);

  // ===========================
  // PROGRAMAR AUTO-CLOSE
  // ===========================
  const existingMessages = await getConversationMessages(conversationId);
  const userMessageCount = existingMessages.filter(m => m.message_type === "incoming").length;
  scheduleAutoClose(conversationId, userMessageCount);
}

// ==================== CONVERSATIONS ====================
async function closeConversation(conversationId: number) {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ status: "resolved" })
    });
    log("info", `✅ Conversación ${conversationId} cerrada automáticamente`);
  } catch (err) { log("error", "❌ Error cerrando conversación:", err); }
}

async function reopenConversation(conversationId: number) {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ status: "open" })
    });
    autoCloseSent[conversationId] = false; // ✅ reiniciar bandera
    scheduleAutoClose(conversationId); // ⬅️ reprogramar auto-close
    log("info", `🔔 Conversación ${conversationId} reabierta`);
  } catch (err) { log("error", "❌ Error reabriendo conversación:", err); }
}

// ==================== CONVERSATION UPDATED ====================
async function handleConversationUpdated(payload: WebhookPayload) {
  const conversationId = payload.conversation?.id;
  if (!conversationId) return;

  const conversationData = await fetchJson<ConversationData>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );

  if (conversationData.status === "resolved") {
    // No hacer nada si la conversación ya fue resuelta
    console.log(`ℹ️ La conversación ${conversationId} ya fue resuelta`);
    await sendBotReply(conversationId, getRandom(FAREWELLS));
  }
}

// ==================== AUXILIARES ====================
async function getConversationLabels(conversationId: number): Promise<string[]> {
  try {
    const data = await fetchJson<{ payload?: { title: string }[] }>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );
    // Filtrar undefined o strings vacías
    return (data.payload?.map(l => l.title).filter(Boolean)) || [];
  } catch (err) {
    log("error", "❌ Error obteniendo etiquetas:", err);
    return [];
  }
}

// ==================== ADD TAGS SAFELY CORREGIDO ====================
async function addTagsSafely(conversationId: number, tags: string[]) {
  try {
    // 1️⃣ Obtener etiquetas actuales
    const existingLabels = await getConversationLabels(conversationId);

    // 2️⃣ Separar etiquetas a eliminar (marcadas con "__remove__")
    const toRemove = tags
      .filter((t) => t.startsWith("__remove__"))
      .map((t) => t.replace("__remove__", ""));

    // 3️⃣ Filtrar etiquetas nuevas (sin "__remove__")
    const toAdd = tags.filter((t) => !t.startsWith("__remove__"));

    // 4️⃣ Definir sets de etiquetas que nunca se eliminan
    const PERMANENT = new Set(PERMANENT_TAGS);
    const SEMI = new Set(TEMP_SEMI_PERMANENT_TAGS);

    // 5️⃣ Eliminar solo las etiquetas que no son permanentes ni semi-permanentes
    for (const tag of toRemove) {
      if (existingLabels.includes(tag) && !PERMANENT.has(tag) && !SEMI.has(tag)) {
        await fetchJson(
          `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
            body: JSON.stringify({ labels: [tag] }),
          }
        );
        log("info", `🗑️ Etiqueta '${tag}' eliminada de conversación ${conversationId}`);
      }
    }

    // 6️⃣ Combinar etiquetas finales respetando permanentes y semi-permanentes
    const combined = Array.from(
      new Set([
        ...existingLabels.filter((l) => PERMANENT.has(l) || SEMI.has(l)), // siempre conservar permanentes y semi
        ...existingLabels.filter((l) => !PERMANENT.has(l) && !SEMI.has(l) && !toRemove.includes(l)), // las que no se eliminan
        ...toAdd.filter(Boolean), // agregar nuevas
      ])
    );

    // 7️⃣ Guardar etiquetas finales
    await fetchJson(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
        body: JSON.stringify({ labels: combined }),
      }
    );

    log("info", `✅ Etiquetas actualizadas para conversación ${conversationId}:`, combined);
  } catch (err) {
    log("error", "❌ Error en addTagsSafely:", err);
  }
}

// ==================== SAFE ADD TAGS SIMPLE ====================
async function safeAddTags(conversationId: number, tags: string[]) {
  try {
    const PERMANENT = new Set(PERMANENT_TAGS);
    const SEMI = new Set(TEMP_SEMI_PERMANENT_TAGS);

    // No agregar duplicadas permanentes ni semi-permanentes
    const filteredTags = tags.filter((t) => t && !PERMANENT.has(t) && !SEMI.has(t));

    if (filteredTags.length === 0) return;

    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ labels: filteredTags }),
    });

    log("info", `📌 Etiquetas agregadas a conversación ${conversationId}:`, filteredTags);
  } catch (err) {
    log("error", "❌ Error en safeAddTags:", err);
  }
}

async function getConversationMessages(conversationId: number) {
  const data = await fetchJson<{ payload: Message[] }>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages?before=<timestamp>&limit=10`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );
  return data.payload;
}

async function sendBotReply(conversationId: number, content: string) {
  try {
    await fetchJson(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: BOT_TOKEN },
        body: JSON.stringify({ content, message_type: "outgoing" })
      }
    );
    log("info", `✅ Mensaje enviado en conversación ${conversationId}:`, content);
  } catch (err) {
    log("error", "❌ Error enviando mensaje:", err);
  }
}


async function getContactIdFromConversation(conversationId: number) {
  const data = await fetchJson<ConversationData>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );
  return data.meta?.sender?.id;
}

async function createOrUpdateContact(name: string, email?: string) {
  try {
    const contact = await fetchJson<ContactData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
        body: JSON.stringify({ name, email })
      }
    );
    return contact.id;
  } catch (err) {
    log("error", "❌ Error creando contacto:", err);
    return undefined;
  }
}

// ==================== CONVERSATION ====================
async function createConversation(contactId: number, inboxId: number) {
  try {
    const conv = await fetchJson<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
        body: JSON.stringify({ inbox_id: inboxId, contact_id: contactId })
      }
    );
    return conv.id;
  } catch (err) {
    log("error", "❌ Error creando conversación:", err);
    return undefined;
  }
}
// ==================== ID INBOX ====================
function getInboxKeyById(inboxId: number) {
  return Object.entries(INBOX_MAP).find(([, id]) => Number(id) === Number(inboxId))?.[0];
}

// ==================== EQUIPOS ====================
async function assignTeamIfNeeded(conversationId: number, teamId: number) {
  if (!teamId) {
    console.warn(`⚠️ No se proporcionó teamId para la conversación ${conversationId}`);
    return;
  }

  try {
    const conversation = await fetchJson<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    if (!conversation.team?.id) {
      await fetchJson(
        `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}/assignments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
          body: JSON.stringify({ team_id: teamId }),
        }
      );
      log("info", `✅ Conversación ${conversationId} asignada al equipo ${teamId}`);
    } else {
      log("info", `ℹ️ La conversación ${conversationId} ya tiene un equipo asignado`);
    }
  } catch (err) {
    console.error("❌ Error asignando equipo:", err);
  }
}

// ==================== PRIORITY ====================
async function setPriorityIfNeeded(conversationId: number, priority: "low" | "medium" | "high") {
  try {
    await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
      body: JSON.stringify({ priority })
    });
  } catch (err) { console.error("❌ Error estableciendo prioridad:", err); }
}

// ==================== HANDLE LEAD TAGS ====================
async function handleLeadTags(
  conversationId: number,
  contactId: number
): Promise<{ tags: string[] }> {
  const tags: string[] = [];
  try {
    const contactData = await fetchJson<ContactData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    const labels = await getConversationLabels(conversationId);

    if (contactData.phone_number) {
      if (!labels.includes("lead_calificado")) tags.push("lead_calificado");
      if (labels.includes("sin_telefono")) tags.push("__remove__sin_telefono");
    } else {
      if (!labels.includes("sin_telefono")) tags.push("sin_telefono");
    }
  } catch (err) {
    log("error", "❌ Error manejando lead tags:", err);
  }

  return { tags };
}

// ==================== HANDLE PHONE DETECTION ====================
async function handlePhoneDetection(
  conversationId: number,
  text: string,
  existingMessages: Message[]
): Promise<{ reply: string | null; tags: string[] }> {
  const tags: string[] = [];
  const lastMessage = existingMessages[existingMessages.length - 1];

  // Regex mejorada: acepta +52 opcional, espacios, guiones, paréntesis
  const phoneRegex = /(?:\+52)?[\s\-().]*\d{2,4}[\s\-().]*\d{3,4}[\s\-().]*\d{4}/;
  const phoneMatch =
    text.match(phoneRegex)?.[0] || lastMessage?.content?.match(phoneRegex)?.[0];

  if (phoneMatch) {
    const cleanPhone = normalizeMexPhone(phoneMatch);
    if (cleanPhone) {
      const contactId = await getContactIdFromConversation(conversationId);
      if (contactId) {
        const contact = await fetchJson<ContactData>(
          `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}`,
          { headers: { api_access_token: PERSONAL_TOKEN } }
        );

        if (!contact.phone_number) {
          await updateContactFromConversation(conversationId, { phone_number: cleanPhone });
        }
      }

      tags.push("telefono_recibido");
      return {
        reply: `📱 Hemos registrado tu teléfono: ${cleanPhone}`,
        tags,
      };
    }
  }

  return { reply: null, tags };
}

// ==================== NORMALIZE PHONE ====================
function normalizeMexPhone(phone: string): string | null {
  // Solo dejar números
  let digits = phone.replace(/\D/g, "");

  // Quitar el 52 inicial si ya lo tiene y es correcto
  if (digits.length === 12 && digits.startsWith("52")) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;

  return null;
}


// ==================== UPDATE CONTACT ====================
async function updateContactFromConversation(
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

async function loadKbCounter(conversationId: number): Promise<Record<string, number>> {
  const conversation = await fetchJson<ConversationData>(
    `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
    { headers: { api_access_token: PERSONAL_TOKEN } }
  );
  return conversation.meta?.kb_counter || {};
}

async function saveKbCounter(conversationId: number, kbCounter: Record<string, number>) {
  await fetchJson(`${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", api_access_token: PERSONAL_TOKEN },
    body: JSON.stringify({ meta: { kb_counter: kbCounter } })
  });
}

function log(level: "info"|"warn"|"error", msg: string, data?: any) {
  console[level](`[${new Date().toISOString()}] ${msg}`, data || "");
}