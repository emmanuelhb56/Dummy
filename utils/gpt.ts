import OpenAI from "openai";
import { sendBotReply, addTagsSafely } from "@/services/chatwoot/chatwoot-services";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateGPTReply(
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
      await addTagsSafely(conversationId, ["error_gpt"]);
      await sendBotReply(conversationId, "⚠️ Nuestro asistente AI no puede responder en este momento. Un agente humano te atenderá pronto.");
    }
    return null;
  }
}
