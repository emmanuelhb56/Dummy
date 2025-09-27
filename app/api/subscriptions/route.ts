import { NextRequest, NextResponse } from "next/server";
import * as Conekta from "conekta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================== Utils ===================== */
function normalizePhoneMX(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  const national10 = digits.replace(/^52/, "").slice(-10);
  if (national10.length === 10) return `+52${national10}`;
  return `+${digits}`;
}
function isValidPhoneMX(raw: string): boolean {
  const digits = String(raw || "").replace(/\D/g, "").replace(/^52/, "");
  return digits.length === 10;
}

function normalizeMetadataValue(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  return String(value);
}

function mergeMetadata(
  ...sources: Array<Record<string, unknown> | undefined>
): Record<string, string> | undefined {
  const entries: Array<[string, string]> = [];
  for (const source of sources) {
    if (!source) continue;
    for (const [key, rawValue] of Object.entries(source)) {
      const normalized = normalizeMetadataValue(rawValue);
      if (normalized != null) {
        entries.push([key, normalized]);
      }
    }
  }
  if (!entries.length) return undefined;
  return Object.fromEntries(entries);
}

/* ===================== Tipos mínimos del SDK ===================== */
type Headers = Record<string, string>;

interface ConektaConfigurationCtor {
  new (opts: { accessToken: string; baseOptions: { headers: Headers } }): unknown;
}
type CreateCustomerBody = {
  name: string;
  email: string;
  phone: string;
  payment_sources: Array<{ type: "card"; token_id: string }>;
  metadata?: Record<string, unknown>;
  shipping_contacts?: Array<{
    receiver: string;
    phone: string;
    between_streets?: string;
    address: {
      street1: string;
      street2?: string;
      postal_code: string;
      country: string;
      state: string;
      city: string;
    };
  }>;
};
type CustomerApi = {
  createCustomer: (b: CreateCustomerBody) => Promise<{ data: { id: string } }>;
};
type SubscriptionsApi = {
  createSubscription: (
    customerId: string,
    body: { plan_id: string; metadata?: Record<string, unknown> }
  ) => Promise<{ data: { id: string } }>;
};
type ConektaSDK = {
  Configuration: ConektaConfigurationCtor;
  CustomersApi: new (cfg: unknown) => CustomerApi;
  SubscriptionsApi: new (cfg: unknown) => SubscriptionsApi;
};
const ConektaTyped = Conekta as unknown as ConektaSDK;

/* ===================== Tipado del request ===================== */
type Body = {
  name: string;
  email: string;
  phone: string;
  plan_id: string;
  token_id: string;
  empresas?: number;
  metadata?: Record<string, unknown>;
  planRef?: string;
  intervalo?: string;
  address?: {
    line1: string;
    line2?: string;
    betweenStreets?: string;
    postalCode: string;
    country: string;
    state: string;
    city: string;
  };
  /** opcional: cadena estable para idempotencia multi-intento (ej: uuid v4 generado en el cliente) */
  request_id?: string;
};

function apiError(message: string, status = 400, detail?: unknown) {
  return NextResponse.json({ error: message, message, status, detail }, { status });
}

function makeIdemKey(base: string): string {
  // header debe ser <= 255, sin espacios raros
  return base.replace(/\s+/g, "_").slice(0, 200);
}

/* ===================== Handler ===================== */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    if (!process.env.CONEKTA_PRIVATE_KEY) {
      return apiError("Falta CONEKTA_PRIVATE_KEY", 500);
    }

    const required: (keyof Body)[] = ["name", "email", "phone", "plan_id", "token_id"];
    const missing = required.filter((k) => (body as Record<string, unknown>)[k] == null);
    if (missing.length) {
      return apiError(`Faltan campos: ${missing.join(", ")}`, 400);
    }

    const phoneNorm = normalizePhoneMX(body.phone);
    if (!isValidPhoneMX(phoneNorm)) {
      return apiError("Teléfono inválido. Debe tener 10 dígitos MX; se antepone +52", 422, { phone: phoneNorm });
    }

    const qty = Math.max(1, Number(body.empresas ?? 1));

    // Config común (sin Idempotency-Key global)
    const baseHeaders: Headers = {
      Accept: "application/vnd.conekta-v2.2.0+json",
      "Content-Type": "application/json",
      "Accept-Language": "es",
    };

    // === 1) Crear Customer (un solo intento; si el cliente ya existe, Conekta igual crea uno nuevo con misma data)
    const configCustomer = new ConektaTyped.Configuration({
      accessToken: process.env.CONEKTA_PRIVATE_KEY!,
      baseOptions: { headers: baseHeaders },
    });
    const customersApi = new ConektaTyped.CustomersApi(configCustomer);

    const customerMetadata = mergeMetadata(
      {
        empresas: qty,
        planRef: body.planRef,
        intervalo: body.intervalo,
        betweenStreets: body.address?.betweenStreets,
      },
      body.metadata
    );

    const customerRes = await customersApi.createCustomer({
      name: body.name,
      email: body.email,
      phone: phoneNorm,
      payment_sources: [{ type: "card", token_id: body.token_id }],
      ...(customerMetadata && { metadata: customerMetadata }),
      ...(body.address && {
        shipping_contacts: [
          {
            receiver: body.name,
            phone: phoneNorm,
            between_streets: body.address.betweenStreets ?? undefined,
            address: {
              street1: body.address.line1,
              ...(body.address.line2 ? { street2: body.address.line2 } : {}),
              postal_code: body.address.postalCode,
              country: body.address.country,
              state: body.address.state,
              city: body.address.city,
            },
          },
        ],
      }),
    });
    const customerId = customerRes.data.id;

    // === 2) Crear N suscripciones del mismo plan, con Idempotency-Key por asiento
    const created: string[] = [];
    const subscriptionDetails: Array<{ id?: string; status?: string; plan_id?: string; billing_cycle_start?: number | null; billing_cycle_end?: number | null; created_at?: number | null; charge_id?: string | null; last_billing_cycle_order_id?: string | null }> = [];
    const seatErrors: Array<{ seat: number; message: string; detail?: unknown }> = [];

    for (let i = 0; i < qty; i++) {
      // Clave de idempotencia estable por asiento:
      // incluye email, plan, asiento y request_id si vino del cliente.
      const idemKey = makeIdemKey(
        `sub:${(body.email || "").toLowerCase()}|plan:${body.plan_id}|seat:${i + 1}|req:${body.request_id || "no-req"}`
      );

      // Crear un Configuration NUEVO con header Idempotency-Key por iteración
      const configSub = new ConektaTyped.Configuration({
        accessToken: process.env.CONEKTA_PRIVATE_KEY!,
        baseOptions: { headers: { ...baseHeaders, "Idempotency-Key": idemKey } },
      });
      const subsApi = new ConektaTyped.SubscriptionsApi(configSub);

      try {
        const subscriptionMetadata = mergeMetadata(
          {
            seat_index: i + 1,
            empresas: qty,
            planRef: body.planRef,
            intervalo: body.intervalo,
            betweenStreets: body.address?.betweenStreets,
          },
          body.metadata
        );

        const subRes = await subsApi.createSubscription(customerId, {
          plan_id: body.plan_id,
          ...(subscriptionMetadata && { metadata: subscriptionMetadata }),
        });
        created.push(subRes.data.id);
        subscriptionDetails.push({
          id: subRes.data.id,
          status: (subRes.data as { status?: string }).status,
          plan_id: (subRes.data as { plan_id?: string }).plan_id,
          billing_cycle_start: (subRes.data as { billing_cycle_start?: number | null }).billing_cycle_start,
          billing_cycle_end: (subRes.data as { billing_cycle_end?: number | null }).billing_cycle_end,
          created_at: (subRes.data as { created_at?: number | null }).created_at ?? null,
          charge_id: (subRes.data as { charge_id?: string | null }).charge_id ?? null,
          last_billing_cycle_order_id: (subRes.data as { last_billing_cycle_order_id?: string | null }).last_billing_cycle_order_id ?? null,
        });
      } catch (e: unknown) {
        // Si Conekta nos devuelve duplicado por idempotencia,
        // reportamos error de asiento pero NO detenemos el resto.
        const errObj = e as { response?: { status?: number; data?: unknown }; body?: unknown; message?: string };
        const detail = errObj?.response?.data ?? errObj?.body ?? errObj?.message ?? e;

        // Heurística: si viene un código de duplicado en detalle, lo señalamos claramente
        const detailMsg =
          (detail as { message?: string } | undefined)?.message ||
          (detail as { details?: Array<{ message?: string }> } | undefined)?.details?.[0]?.message ||
          "Fallo al crear suscripción";
        seatErrors.push({ seat: i + 1, message: detailMsg, detail });
      }
    }

    // === 3) Bloque display para la UI (siempre se arma, aun parcial)
    const unitAmount = Number((body.metadata as { chosenBase?: unknown } | undefined)?.chosenBase ?? 0);
    const title = String((body.metadata as { chosenTitle?: unknown } | undefined)?.chosenTitle ?? "Suscripción");
    const display = {
      items: [
        {
          title,
          name: title,
          sku: body.planRef ?? body.plan_id,
          unitAmount,
          quantity: qty,
          lineTotal: unitAmount * qty,
          intervalo: body.intervalo,
        },
      ],
      summary: { shipping: 0, discounts: 0, commission: 0 },
      subscriptions: subscriptionDetails.map((sub, index) => ({
        seat: index + 1,
        ...sub,
      })),
    };

    // Respuesta
    if (seatErrors.length > 0 && created.length === 0) {
      // Todo falló (típicamente duplicado en todos)
      return NextResponse.json(
        {
          error: "No se pudieron crear suscripciones",
          message: "Fallo al crear todas las suscripciones (posible duplicado).",
          detail: { seatErrors },
          customer_id: customerId,
          count: 0,
          display,
          subscription_details: subscriptionDetails,
        },
        { status: 409 }
      );
    }

    if (seatErrors.length > 0) {
      // Parcialmente exitoso
      return NextResponse.json(
        {
          mode: "subscription-multi",
          warning: "Algunas suscripciones no se crearon por duplicado u otro error.",
          partial_error: true,
          seatErrors,
          customer_id: customerId,
          subscription_ids: created,
          count: created.length,
          display,
          subscription_details: subscriptionDetails,
        },
        { status: 207 } // Multi-Status
      );
    }

    // Todo OK
    return NextResponse.json(
      {
        mode: "subscription-multi",
        customer_id: customerId,
        subscription_ids: created,
        count: created.length,
        display,
        subscription_details: subscriptionDetails,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown }; body?: unknown; message?: string };
    const status = e?.response?.status ?? 500;
    const detail = e?.response?.data ?? e?.body ?? e?.message ?? err;
    const message =
      (detail as { details?: Array<{ message?: string }> } | undefined)?.details?.[0]?.message ||
      (detail as { message?: string } | undefined)?.message ||
      "No se pudo crear la suscripción";

    try {
      // eslint-disable-next-line no-console
      console.error("subscription error:", JSON.stringify(detail, null, 2));
    } catch {
      // eslint-disable-next-line no-console
      console.error("subscription error (non-serializable):", detail);
    }

    return NextResponse.json({ error: message, message, status, detail }, { status });
  }
}
