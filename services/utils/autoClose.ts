import { fetchJson } from "@/services/utils/fetchJson";
import { sendBotReplySafe, addTagsSafely, closeConversation } from "@/services/chatwoot/chatwoot-services";
import { FAREWELLS } from "@/utils/chatbot-config";
import { log } from "@/services/utils/logging";
import { ACCOUNT_ID, CHATWOOT_URL, PERSONAL_TOKEN } from "./kb-clickbalance";

const BASE_TIMEOUT = 30000;
const TIME_INCREMENT = 600000;
const autoCloseSent: Record<number, boolean> = {};
const autoCloseTimers: Record<number, NodeJS.Timeout> = {};

export function scheduleAutoClose(conversationId: number, userMessageCount = 0) {
  if (autoCloseSent[conversationId] || autoCloseTimers[conversationId]) return;
  const timeout = BASE_TIMEOUT + TIME_INCREMENT * userMessageCount;
  log("info", `⏳ scheduleAutoClose para conversación ${conversationId}, timeout = ${timeout}ms`);

  autoCloseTimers[conversationId] = setTimeout(async () => {
    try {
      if (autoCloseSent[conversationId]) return;
      const conversationData = await fetchJson<any>(
        `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
        { headers: { api_access_token: PERSONAL_TOKEN } }
      );
      if (conversationData.status !== "open") return;

      await addTagsSafely(conversationId, ["no_respuesta"]);
      await sendBotReplySafe(conversationId, FAREWELLS[Math.floor(Math.random()*FAREWELLS.length)]);
      await closeConversation(conversationId);

      autoCloseSent[conversationId] = true;
      log("info", `✅ Conversación ${conversationId} cerrada automáticamente por inactividad`);
    } catch (err) { log("error", "❌ Error en autoClose:", err); }
    finally { delete autoCloseTimers[conversationId]; }
  }, timeout);
}
