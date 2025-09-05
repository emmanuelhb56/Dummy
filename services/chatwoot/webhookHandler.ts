import { KNOWLEDGE_BASE, findKBEntry, MENU_MESSAGE, MENU_MAP, shouldUseGPT } from "@/services/utils/kb-clickbalance";
import { generateReply } from "@/services/gpt/generateReply";
import { addTagsSafely, sendBotReplySafe, sendKBEntry } from "./chatwoot-services";
import { scheduleAutoClose } from "@/services/utils/autoClose";
import { WebhookPayload } from "@/types/chatwoot";
import { log } from "../utils/logging";

/**
 * Helper seguro para obtener conversationId
 */
function getConversationId(payload: WebhookPayload): number | undefined {
  return payload.conversation?.id;
}

/**
 * Orquestador principal del webhook de Chatwoot
 */
export async function handleWebhook(payload: WebhookPayload) {
  try {
    const { event, message } = payload;
    const conversationId = getConversationId(payload);
    if (!conversationId) return log("error", "No se encontró conversationId", payload);

    // 🔹 Nueva conversación → menú inicial
    if (event === "conversation_created") {
      await sendBotReplySafe(conversationId, MENU_MESSAGE);
      scheduleAutoClose(conversationId, 0); // inicia el auto-close
      return;
    }

    // 🔹 Nuevo mensaje entrante
    if (event === "message_created" && message?.message_type === "incoming") {
      const text = (message.content || "").trim();

      // 1️⃣ Usuario pide menú
      if (/^(menú|menu|opciones)$/i.test(text)) {
        await sendBotReplySafe(conversationId, MENU_MESSAGE);
        scheduleAutoClose(conversationId, 1);
        return;
      }

      // 2️⃣ Usuario selecciona opción numérica
      if (/^\d+$/.test(text)) {
        const kbId = MENU_MAP[text];
        const entry = KNOWLEDGE_BASE.find(k => k.id === kbId);
        if (entry) {
          await sendKBEntry(conversationId, entry);
          scheduleAutoClose(conversationId, 1);
          return;
        }
      }

      // 3️⃣ Match por KB
      const kbEntry = findKBEntry(text, KNOWLEDGE_BASE);
      if (kbEntry) {
        await sendKBEntry(conversationId, kbEntry);
        scheduleAutoClose(conversationId, 1);
        return;
      }

      // 4️⃣ Fallback: usar GPT
      if (shouldUseGPT(text, KNOWLEDGE_BASE)) {
        const reply = await generateReply(conversationId, text);
        await sendBotReplySafe(conversationId, reply);
        await addTagsSafely(conversationId, ["gpt_fallback"]);
        scheduleAutoClose(conversationId, 1);
      }
    }

    // 🔹 Conversación cerrada
    if (event === "conversation_status_changed" && payload.conversation?.status === "resolved") {
      log("info", `Conversación ${conversationId} cerrada ✅`);
    }

  } catch (err) {
    log("error", "Error en handleWebhook ❌", err);
  }
}
