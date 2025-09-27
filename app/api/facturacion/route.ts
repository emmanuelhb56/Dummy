// app/api/facturacion/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* ============== Tipos mínimos de Conekta ============== */
type ConektaList<T> = { object?: string; data?: T[] };

type ConektaCustomer = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type ConektaOrder = {
  id: string;
  amount?: number;
  currency?: string;
  payment_status?: string;
  created_at?: number;
  customer_info?: { customer_id?: string; name?: string; email?: string; phone?: string };
  // Campos adicionales opcionales ignorados por el panel
  [k: string]: unknown;
};

type ConektaSubscription = {
  id: string;
  status?: string;
  plan_id?: string;
  trial_end?: number | null;
  billing_cycle_start?: number | null;
  billing_cycle_end?: number | null;
  last_billing_cycle_order_id?: string | null;
  created_at?: number | null;
  object?: string;
  // resto ignorado
  [k: string]: unknown;
};

/* ============== Helpers ============== */
function parseJSONSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function conektaFetch<T>(path: string, key: string): Promise<T> {
  const auth = Buffer.from(`${key}:`).toString("base64");
  const res = await fetch(`https://api.conekta.io${path}`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/vnd.conekta-v2.2.0+json",
      "Content-Type": "application/json",
      "Accept-Language": "es",
    },
    cache: "no-store",
  });

  const text = await res.text();
  const parsed = parseJSONSafe<Record<string, unknown>>(text);

  if (!res.ok) {
    const message =
      (parsed?.details as unknown as { message?: string }[] | undefined)?.[0]?.message ??
      (typeof parsed?.object === "string" ? parsed.object : undefined) ??
      (text || `HTTP ${res.status}`);
    throw new Error(`Conekta ${path}: ${message}`);
  }

  // si no hay JSON, devolvemos objeto vacío del tipo esperado
  return (parsed as unknown as T) ?? ({} as T);
}

/** Type guard para filtrar órdenes por customer_id en el fallback */
function isOrderForCustomer(o: unknown, customerId: string): o is ConektaOrder {
  if (!o || typeof o !== "object") return false;
  const ci = (o as { customer_info?: unknown }).customer_info;
  if (!ci || typeof ci !== "object") return false;
  const cid = (ci as { customer_id?: unknown }).customer_id;
  return typeof cid === "string" && cid === customerId;
}

/* ============== Handler ============== */
export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get("customer");
    if (!customerId) {
      return NextResponse.json({ error: "Falta customer" }, { status: 400 });
    }

    const key = process.env.CONEKTA_PRIVATE_KEY;
    if (!key) {
      return NextResponse.json({ error: "Falta CONEKTA_PRIVATE_KEY" }, { status: 500 });
    }

    // 1) Cliente
    let customer: ConektaCustomer = { id: customerId };
    try {
      const c = await conektaFetch<ConektaCustomer>(`/customers/${customerId}`, key);
      customer = {
        id: c?.id ?? customerId,
        name: c?.name ?? undefined,
        email: c?.email ?? undefined,
        phone: c?.phone ?? undefined,
      };
    } catch {
      // dejamos el mínimo shape
    }

    // 2) Suscripciones del cliente
    let subscriptions: ConektaSubscription[] = [];
    try {
      const subs = await conektaFetch<ConektaList<ConektaSubscription>>(
        `/customers/${customerId}/subscriptions?limit=50`,
        key
      );
      subscriptions = Array.isArray(subs?.data) ? subs.data : [];
    } catch {
      subscriptions = [];
    }

    // 3) Órdenes del cliente (endpoint dedicado; si falla, fallback global)
    let orders: ConektaOrder[] = [];
    try {
      const ords = await conektaFetch<ConektaList<ConektaOrder>>(
        `/customers/${customerId}/orders?limit=50`,
        key
      );
      orders = Array.isArray(ords?.data) ? ords.data : [];
    } catch {
      try {
        const all = await conektaFetch<ConektaList<unknown>>(`/orders?limit=50`, key);
        const data = Array.isArray(all?.data) ? all.data : [];
        orders = data.filter((o): o is ConektaOrder => isOrderForCustomer(o, customerId));
      } catch {
        orders = [];
      }
    }

    return NextResponse.json({ customer, orders, subscriptions }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error inesperado";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
