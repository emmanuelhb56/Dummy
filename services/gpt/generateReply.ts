import { fetchJson } from "@/services/utils/fetchJson";

import type { ConversationData, ContactData } from "@/types/chatwoot";
import { ACCOUNT_ID, CHATWOOT_URL, KNOWLEDGE_BASE, MENU_MESSAGE, PERSONAL_TOKEN } from "@/services/utils/kb-clickbalance";
import { sendBotReplySafe, addTagsSafely, assignTeamIfNeeded, setPriorityIfNeeded } from "@/services/chatwoot/chatwoot-services";
import { log } from "@/services/utils/logging";

// Función principal para generar respuesta
export async function generateReply(conversationId: number, userMessage: string): Promise<string> {
  try {
    // 1️⃣ Obtener conversación
    const conversation = await fetchJson<ConversationData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${conversationId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    // 2️⃣ Obtener contacto
    const contact: ContactData = await fetchJson<ContactData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${conversation.contact_id}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    // 3️⃣ Detectar categoría en base a triggers de KB
    const matchedEntry = KNOWLEDGE_BASE.find(entry =>
      entry.triggers.some(trigger => userMessage.toLowerCase().includes(trigger.toLowerCase()))
    );

    let reply = "";
    let tags: string[] = [];
    let assignTeamId: number | undefined;
    let priority: "low" | "medium" | "high" | undefined;

    if (matchedEntry) {
      reply = matchedEntry.response;
      tags = matchedEntry.actions?.addTags || [];
      assignTeamId = matchedEntry.actions?.assignTeamId;
      priority = matchedEntry.actions?.priority as typeof priority;
    } else {
      // Si no coincide, enviar menú
      reply = `Hola ${contact.name || ""}, no entendí tu mensaje.\n\n${MENU_MESSAGE}`;
      tags = ["kb_default"];
    }

    // 4️⃣ Enviar respuesta al usuario
    await sendBotReplySafe(conversationId, reply);

    // 5️⃣ Agregar etiquetas
    if (tags.length) await addTagsSafely(conversationId, tags);

    // 6️⃣ Asignar equipo si aplica
    if (assignTeamId) await assignTeamIfNeeded(conversationId, assignTeamId);

    // 7️⃣ Establecer prioridad si aplica
    if (priority) await setPriorityIfNeeded(conversationId, priority);

    log("info", `Respuesta generada para conversación ${conversationId} ✅`);

    // ✅ Devuelve el texto generado
    return reply;

  } catch (err) {
    log("error", `Error generando respuesta para conversación ${conversationId} ❌`, err);
    // Fallback
    await sendBotReplySafe(conversationId, "Lo siento, hubo un error al procesar tu mensaje.");
    return "Lo siento, hubo un error al procesar tu mensaje.";
  }
}
