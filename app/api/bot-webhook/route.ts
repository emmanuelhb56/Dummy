import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/services/chatwoot/webhookHandler";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    await handleWebhook(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
