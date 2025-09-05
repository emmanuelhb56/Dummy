import { fetchJsonWithRetry } from "@/services/utils/fetchJson";
import { sendBotReplySafe, addTagsSafely, closeConversation } from "@/services/chatwoot/chatwoot-services";
import { FAREWELLS } from "@/utils/chatbot-config";
import { log } from "@/services/utils/logging";
import { ACCOUNT_ID, CHATWOOT_URL, PERSONAL_TOKEN } from "./kb-clickbalance";

const BASE_TIMEOUT = 30000;        // 30s por defecto
const TIME_INCREMENT = 600000;     // +10min por mensaje
const autoCloseSent: Record<number, boolean> = {};
const autoCloseTimers: Record<number, NodeJS.Timeout> = {};

export function scheduleAutoClose(conversationId: number, userMessageCount = 0) {
  // Evitar múltiples timers para la misma conversación
  if (autoCloseSent[conversationId] || autoCloseTimers[conversationId]) return;

  const timeout = BASE_TIMEOUT + TIME_INCREMENT * userMessageCount;
  log("info", `⏳ scheduleAutoClose para conversación ${conversationId}, timeout = ${timeout}ms`);

  autoCloseTimers[conversationId] = setTimeout(async () => {
    try {
      // Verificar si ya fue cerrada
      if (autoCloseSent[conversationId]) return;

      const conversationData = await fetchJsonWithRetry<any>(
        `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
        { headers: { api_access_token: PERSONAL_TOKEN } }
      );

      // Validar que la conversación exista y esté abierta
      if (!conversationData || conversationData.status !== "open") {
        log("info", `Conversación ${conversationId} no requiere cierre (status=${conversationData?.status})`);
        return;
      }

      // Agregar tag de no respuesta
      await addTagsSafely(conversationId, ["no_respuesta"]);

      // Escoger mensaje de despedida aleatorio y loguearlo
      const farewell = FAREWELLS[Math.floor(Math.random() * FAREWELLS.length)];
      await sendBotReplySafe(conversationId, farewell);
      log("info", `Mensaje de despedida enviado a conversación ${conversationId}: ${farewell}`);

      // Cerrar conversación
      await closeConversation(conversationId);

      autoCloseSent[conversationId] = true;
      log("info", `✅ Conversación ${conversationId} cerrada automáticamente por inactividad`);
    } catch (err) {
      log("error", `❌ Error en autoClose para conversación ${conversationId}:`, err);
    } finally {
      // Limpiar timer
      delete autoCloseTimers[conversationId];
    }
  }, timeout);
}