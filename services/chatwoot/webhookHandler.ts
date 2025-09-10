import { 
  KNOWLEDGE_BASE, 
  findKBEntry, 
  MENU_MESSAGE, 
  MENU_MAP, 
  shouldUseGPT, 
  SMALL_TALK_TRIGGERS 
} from "@/services/utils/kb-clickbalance";
import { generateReply } from "@/services/gpt/generateReply";
import { 
  addTagsSafely, 
  getConversationLabels, 
  sendBotReply, 
  sendBotReplySafe, 
  sendKBEntry 
} from "./chatwoot-services";
import { scheduleAutoClose } from "@/services/utils/autoClose";
import { Message, WebhookPayload } from "@/types/chatwoot";
import { log } from "../utils/logging";
import { handlePhoneDetection } from "../utils/leadDetection";

/**
 * Helper seguro para obtener conversationId
 */
function getConversationId(payload: WebhookPayload): number | undefined {
  return payload.conversation?.id || payload.current_conversation?.id;
}

/**
 * Orquestador principal del webhook de Chatwoot
 */
export async function handleWebhook(payload: WebhookPayload) {
  try {
    const { event, message } = payload;
    const conversationId = getConversationId(payload);

    if (!conversationId) {
      log("warn", "No se encontró conversationId, ignorando evento", payload);
      return;
    }

    // 🔹 Obtener etiquetas actualizadas de la conversación
    const conversationLabels = await getConversationLabels(conversationId);

    // 🔹 Nueva conversación o widget abierto → enviar menú inicial solo si no se ha enviado
    const menuSent = conversationLabels.includes("menu_enviado");
    if ((event === "conversation_created" || event === "webwidget_triggered") && !menuSent) {
      log("info", `🌟 Conversación ${conversationId} iniciada o widget abierto, enviando menú inicial`);
      await sendBotReply(conversationId, MENU_MESSAGE);
      await addTagsSafely(conversationId, ["menu_enviado", "widget_abierto"]);
      scheduleAutoClose(conversationId, 1);
      return;
    }

    // 🔹 Nuevo mensaje entrante
    if (event === "message_created" && message?.message_type === "incoming") {
      const rawText = (message.content || "").trim();
      const text = rawText.toLowerCase();

      log("info", `💬 Mensaje entrante en conversación ${conversationId}: ${rawText}`);

      const safeMessage: Message = {
        content: message.content || "",
        message_type: message.message_type,
        tags: message.tags || []
      };

      // 0️⃣ Small talk: interceptar antes que todo
      const smallTalkHandled = conversationLabels.includes("small_talk_respondido");
      if (!smallTalkHandled && SMALL_TALK_TRIGGERS.some(trigger => text.includes(trigger))) {
        log("info", `🔹 Small talk detectado en conversación ${conversationId}`);
        await sendBotReplySafe(conversationId, "¡Hola! Escribe 'menú' para ver las opciones de soporte.");
        await addTagsSafely(conversationId, ["small_talk_respondido"]);
        return;
      }

      // 1️⃣ Usuario pide menú
      if (/^(menú|menu|opciones)$/i.test(text)) {
        log("info", `🔹 Solicitud de menú en conversación ${conversationId}`);
        await sendBotReplySafe(conversationId, MENU_MESSAGE);
        scheduleAutoClose(conversationId, 1);
        return;
      }

      // 2️⃣ Usuario selecciona opción numérica
      if (/^\d+$/.test(text)) {
        const kbId = MENU_MAP[text];
        if (kbId) {
          const entry = KNOWLEDGE_BASE.find(k => k.id === kbId);
          if (entry) {
            log("info", `🔹 Selección de menú válida: ${text} → ${kbId}`);
            try {
              await sendKBEntry(conversationId, entry);
              await addTagsSafely(conversationId, ["menu_enviado"]);
            } catch (err) {
              log("error", `Error enviando KBEntry en conversación ${conversationId}`, err);
              await sendBotReplySafe(conversationId, "❌ Ocurrió un error al obtener la información, intenta nuevamente.");
            }
            scheduleAutoClose(conversationId, 1);
            return;
          }
        }
        log("warn", `⚠️ Opción de menú no válida: ${text} en conversación ${conversationId}`);
        await sendBotReplySafe(conversationId, "❌ Opción no válida. Escribe 'menú' para ver opciones.");
        return;
      }

      // 3️⃣ Match por KB
      const kbEntry = findKBEntry(text, KNOWLEDGE_BASE);
      if (kbEntry) {
        log("info", `🔹 Coincidencia KB encontrada: ${kbEntry.id}`);
        try {
          await sendKBEntry(conversationId, kbEntry);
        } catch (err) {
          log("error", `Error enviando KBEntry en conversación ${conversationId}`, err);
          await sendBotReplySafe(conversationId, "❌ Ocurrió un error al obtener la información, intenta nuevamente.");
        }
        scheduleAutoClose(conversationId, 1);
        return;
      }

      // 4️⃣ Fallback: usar GPT (solo si no se ha hecho antes)
      const gptFallbackHandled = conversationLabels.includes("gpt_fallback_respondido");
      if (shouldUseGPT(text, KNOWLEDGE_BASE) && !gptFallbackHandled) {
        log("info", `🔹 Fallback GPT activado para conversación ${conversationId}`);
        try {
          const reply = await generateReply(conversationId, rawText);
          await sendBotReplySafe(conversationId, reply);
          await addTagsSafely(conversationId, ["gpt_fallback_respondido"]);
        } catch (err) {
          log("error", `Error generando respuesta GPT en conversación ${conversationId}`, err);
          await sendBotReplySafe(conversationId, "❌ Ocurrió un error al generar la respuesta, intenta nuevamente.");
        }
        scheduleAutoClose(conversationId, 1);
      }
    }

    // 🔹 Conversación cerrada
    if (event === "conversation_status_changed" && payload.conversation?.status === "resolved") {
      log("info", `✅ Conversación ${conversationId} cerrada`);
      await sendBotReplySafe(conversationId, 
        "Gracias por contactarnos. Si necesitas más ayuda, escribe 'menú' para ver las opciones de soporte."
      );
    }

  } catch (err) {
    log("error", "❌ Error en handleWebhook", err);
  }
}
