import { fetchJsonWithRetry } from "@/services/utils/fetchJson";
import { getConversationLabels, updateContactFromConversation, getContactIdFromConversation } from "@/services/chatwoot/chatwoot-services";
import { ContactData, Message } from "@/types/chatwoot";

import { log } from "@/services/utils/logging";
import { ACCOUNT_ID, CHATWOOT_URL, PERSONAL_TOKEN } from "./kb-clickbalance";

// ---------------------- Normalización ----------------------
export function normalizeMexPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, ""); // solo números

  // +52 + 10 dígitos o solo 10 dígitos
  if (digits.length === 12 && digits.startsWith("52")) return `+${digits}`;
  if (digits.length === 10) return `+52${digits}`;

  return null; // no válido
}

// ---------------------- Detección y actualización ----------------------
export async function handlePhoneDetection(
  conversationId: number,
  text: string,
  existingMessages: Message[]
): Promise<{ reply: string | null; tags: string[] }> {
  const tags: string[] = [];
  const lastMessage = existingMessages[existingMessages.length - 1];
  const candidate = text || lastMessage?.content;

  if (!candidate) return { reply: null, tags };

  // Regex mejorada: acepta +52 opcional, espacios, guiones, paréntesis
  const phoneRegex = /(?:\+52)?[\s\-().]*(\d{2,4})[\s\-().]*(\d{3,4})[\s\-().]*(\d{4})/;
  const match = candidate.match(phoneRegex)?.[0];

  if (!match) return { reply: null, tags };

  const cleanPhone = normalizeMexPhone(match);
  if (!cleanPhone) return { reply: null, tags };

  try {
    const contactId = await getContactIdFromConversation(conversationId);
    if (!contactId) return { reply: null, tags };

    const contact = await fetchJsonWithRetry<ContactData>(
      `${CHATWOOT_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/${contactId}`,
      { headers: { api_access_token: PERSONAL_TOKEN } }
    );

    if (!contact.phone_number) {
      await updateContactFromConversation(conversationId, { phone_number: cleanPhone });
      log("info", `Número registrado para contacto ${contactId}: ${cleanPhone}`);
    } else {
      log("info", `Contacto ${contactId} ya tiene teléfono: ${contact.phone_number}`);
    }

    // Etiquetas
    tags.push("telefono_recibido");

    // Eliminar etiqueta sin_telefono si existía
    const labels = await getConversationLabels(conversationId);
    if (labels.includes("sin_telefono")) {
      tags.push("__remove__sin_telefono");
    }

    return {
      reply: contact.phone_number ? null : `📱 Hemos registrado tu teléfono: ${cleanPhone}`,
      tags,
    };
  } catch (err) {
    log("error", "❌ Error actualizando teléfono:", err);
    return { reply: null, tags };
  }
}
