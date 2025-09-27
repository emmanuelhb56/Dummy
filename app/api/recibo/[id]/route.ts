// app/api/recibo/[id]/route.ts
import { NextRequest } from "next/server";
import PDFDocument from "pdfkit/js/pdfkit.standalone";

/* ===================== Tipos ===================== */
type LineItem = { name?: string; description?: string; quantity?: number; unit_price?: number };
type PaymentMethod = { type?: string; brand?: string; last4?: string; service_name?: string };
type Charge = {
  description?: string;
  paid_at?: number;
  status?: string;
  subscription_id?: string;
  payment_method?: PaymentMethod;
};
interface ConektaOrder {
  id: string;
  amount: number;
  currency: string;
  payment_status?: string;
  created_at?: number;
  customer_info?: { name?: string; email?: string; phone?: string };
  line_items?: { data?: LineItem[] } | null;
  charges?: { data?: Charge[] } | null;
}

/* ===================== Utils ===================== */
const peso = (cents: number, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format((cents || 0) / 100);

const fmtDT = (ts?: number) =>
  ts ? new Date(ts * 1000).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "—";

function nextRenewal(order: ConektaOrder, charge?: Charge): string | null {
  const base = (charge?.subscription_id && (charge?.paid_at || order.created_at)) || null;
  if (!base) return null;
  const d = new Date(base * 1000);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}

const statusMap: Record<string, string> = {
  paid: "Pagado",
  pending_payment: "Pendiente de pago",
  declined: "Rechazado",
  canceled: "Cancelado",
  expired: "Expirado",
};

const COLORS = {
  border: "#E5E7EB",
  textMuted: "#6B7280",
};

/** Recorta al centro: sub_2yk...Gdzj → sub_2yk…Gdzj */
function shortenMiddle(str: string, keep = 6) {
  if (!str) return "";
  if (str.length <= keep * 2 + 1) return str;
  return `${str.slice(0, keep)}…${str.slice(-keep)}`;
}

/** Dibuja una tarjeta (rounded rect) alrededor de un bloque */
function drawCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number) {
  doc.roundedRect(x, y, w, h, 10).strokeColor(COLORS.border).stroke().fillColor("black");
}

/** Línea horizontal */
function hr(doc: PDFKit.PDFDocument, x: number, y: number, w: number) {
  doc.moveTo(x, y).lineTo(x + w, y).strokeColor(COLORS.border).stroke().fillColor("black");
}

/** Renderiza “Etiqueta: Valor” con wrapping */
function renderLabelRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  w: number,
  labelW = 110
) {
  doc.font("Courier-Bold").fontSize(11).text(label, x, y, { width: labelW });
  const textX = x + labelW + 4;
  const opts = { width: w - labelW - 4 };
  doc.font("Courier").fontSize(11).text(value, textX, y, opts);
  return doc.y + 6; // siguiente Y
}

/* ===================== Handler ===================== */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const apiKey = process.env.CONEKTA_PRIVATE_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta CONEKTA_PRIVATE_KEY" }), { status: 500 });
  }

  // Obtener orden de Conekta
  const res = await fetch(`https://api.conekta.io/orders/${id}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      Accept: "application/vnd.conekta-v2.2.0+json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: "No se pudo obtener la orden", detail }), { status: res.status });
  }

  const order = (await res.json()) as ConektaOrder;
  const charge = order.charges?.data?.[0];

  // Normalizar items
  const items = order.line_items?.data ?? [];
  const prettyItems =
    items.length > 0
      ? items.map((it) => ({
          name:
            it.name && it.name !== "default"
              ? it.name
              : charge?.description || it.description || "Suscripción",
          quantity: Math.max(1, it.quantity ?? 1),
          unit_price: it.unit_price ?? 0,
        }))
      : [{ name: charge?.description || "Suscripción", quantity: 1, unit_price: order.amount }];

  const metodo =
    (charge?.payment_method?.brand
      ? `${String(charge.payment_method.brand).toUpperCase()} ••••${charge.payment_method.last4 ?? ""}`
      : charge?.payment_method?.service_name || charge?.payment_method?.type || "—");

  /* ========== PDF ========== */
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  const bufs: Buffer[] = [];
  doc.on("data", (c: Buffer) => bufs.push(c));
  const done = new Promise<Buffer>((r) => doc.on("end", () => r(Buffer.concat(bufs))));

  // Header
  doc.font("Courier-Bold").fontSize(26).text("ERPExpert", { align: "left" });
  doc.moveDown(0.2);
  doc.fontSize(16).text("Recibo de pago");
  doc.moveDown(0.2);

  // Línea de metadatos
  doc.font("Courier").fontSize(10).fillColor(COLORS.textMuted);
  doc.text(`Orden: ${order.id}`, { continued: true });
  doc.text(`   Fecha: ${fmtDT(order.created_at)}`, { continued: true });
  doc.text(`   Estado: ${statusMap[order.payment_status ?? ""] ?? (order.payment_status || "—")}`);
  doc.fillColor("black");
  hr(doc, doc.page.margins.left, doc.y + 6, doc.page.width - doc.page.margins.left - doc.page.margins.right);
  doc.moveDown(1.2);

  // Medidas
  const usableW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 20;
  const colW = (usableW - gap) / 2;
  const Lx = doc.page.margins.left;
  const Rx = Lx + colW + gap;

  /* ----- Card Cliente ----- */
  const cY0 = doc.y;
  doc.font("Courier-Bold").fontSize(12).text("Cliente", Lx + 12, cY0 + 10);
  let cy = cY0 + 28;
  cy = renderLabelRow(doc, "Nombre:", order.customer_info?.name ?? "—", Lx + 12, cy, colW - 24);
  cy = renderLabelRow(doc, "Correo:", order.customer_info?.email ?? "—", Lx + 12, cy, colW - 24);
  cy = renderLabelRow(doc, "Teléfono:", order.customer_info?.phone ?? "—", Lx + 12, cy, colW - 24);
  const cY1 = cy + 10;
  drawCard(doc, Lx, cY0, colW, cY1 - cY0);

  /* ----- Card Detalle de orden ----- */
  const oY0 = cY0;
  doc.font("Courier-Bold").fontSize(12).text("Detalle de orden", Rx + 12, oY0 + 10);
  let oy = oY0 + 28;
  oy = renderLabelRow(doc, "Moneda:", order.currency || "—", Rx + 12, oy, colW - 24);
  oy = renderLabelRow(doc, "Monto:", peso(order.amount, order.currency), Rx + 12, oy, colW - 24);
  oy = renderLabelRow(doc, "Creada:", fmtDT(order.created_at), Rx + 12, oy, colW - 24);
  oy = renderLabelRow(
    doc,
    "Estado:",
    statusMap[order.payment_status ?? ""] ?? (order.payment_status || "—"),
    Rx + 12,
    oy,
    colW - 24
  );
  const oY1 = oy + 10;
  drawCard(doc, Rx, oY0, colW, oY1 - oY0);

  doc.moveDown(1.6);

  /* ----- Conceptos (tabla) ----- */
  doc.font("Courier-Bold").fontSize(12).text("Conceptos", Lx, doc.y);
  const tX = Lx;
  const colConcept = Math.min(usableW * 0.5, 280);
  const colQty = 50;
  const colPrice = 84;
  const colSubtotal = 96;
  const tW = colConcept + colQty + colPrice + colSubtotal;

  let y = doc.y + 8;
  doc.font("Courier-Bold").fontSize(11);
  doc.text("Concepto", tX, y, { width: colConcept });
  doc.text("Cant.", tX + colConcept, y, { width: colQty, align: "center" });
  doc.text("Precio unit.", tX + colConcept + colQty, y, { width: colPrice, align: "right" });
  doc.text("Subtotal", tX + colConcept + colQty + colPrice, y, { width: colSubtotal, align: "right" });
  y += 14;
  hr(doc, tX, y, tW);
  y += 6;

  doc.font("Courier").fontSize(11);
  let total = 0;
  for (const it of prettyItems) {
    const sub = it.quantity * it.unit_price;
    total += sub;
    doc.fillColor("black");
    doc.text(it.name, tX, y, { width: colConcept });
    doc.text(String(it.quantity), tX + colConcept, y, { width: colQty, align: "center" });
    doc.text(peso(it.unit_price, order.currency), tX + colConcept + colQty, y, { width: colPrice, align: "right" });
    doc.text(peso(sub, order.currency), tX + colConcept + colQty + colPrice, y, { width: colSubtotal, align: "right" });
    y += 16;
    doc.fillColor(COLORS.border);
    hr(doc, tX, y - 2, tW);
  }
  doc.fillColor("black");
  hr(doc, tX, y, tW);
  y += 6;
  doc.font("Courier-Bold").text("TOTAL", tX + colConcept + colQty, y, { width: colPrice, align: "right" });
  doc.text(peso(total, order.currency), tX + colConcept + colQty + colPrice, y, {
    width: colSubtotal,
    align: "right",
  });

  doc.moveDown(1.6);

  /* ----- Tarjeta Pago (grid 2×2 con cálculo de altura por fila) ----- */
  const payPad = 12;
  const payGap = 32; // más espacio entre columnas
  const payX = Lx;
  const payY0 = doc.y;
  const payW = usableW;
  const half = (payW - payPad * 2 - payGap) / 2;
  const labelW = 100;
  const valW = half - labelW - 4;

  // Header de la tarjeta
  doc.font("Courier-Bold").fontSize(12).text("Pago", payX + payPad, payY0 + payPad);
  doc.moveDown(0.4);

  // posición inicial para filas
  doc.y = payY0 + payPad + 18;

  function row(k1: string, v1: string, k2?: string, v2?: string) {
    const y0 = doc.y;

    // Columna izquierda
    const leftLabelX = payX + payPad;
    const leftValueX = leftLabelX + labelW + 4;

    doc.font("Courier-Bold").fontSize(10).text(`${k1}:`, leftLabelX, y0, { width: labelW });
    doc.font("Courier").fontSize(10).text(v1 || "—", leftValueX, y0, { width: valW });

    const h1 = Math.max(
      doc.heightOfString(`${k1}:`, { width: labelW }),
      doc.heightOfString(v1 || "—", { width: valW })
    );

    // Columna derecha (opcional)
    let h2 = 0;
    if (k2) {
      const rightLabelX = payX + payPad + half + payGap;
      const rightValueX = rightLabelX + labelW + 4;

      doc.font("Courier-Bold").fontSize(10).text(`${k2}:`, rightLabelX, y0, { width: labelW });
      doc.font("Courier").fontSize(10).text(v2 || "—", rightValueX, y0, { width: valW });

      h2 = Math.max(
        doc.heightOfString(`${k2}:`, { width: labelW }),
        doc.heightOfString(v2 || "—", { width: valW })
      );
    }

    const rowH = Math.max(h1, h2) + 8; // aire vertical
    doc.y = y0 + rowH;
  }

  const estadoTxt = statusMap[order.payment_status ?? ""] ?? (order.payment_status || "—");
  row("Método", metodo, "Estado", estadoTxt);
  row("Fecha de pago", fmtDT(charge?.paid_at), "Fecha creación", fmtDT(order.created_at));

  if (charge?.subscription_id) {
    // fila con id corto + próxima renovación
    row("Suscripción", shortenMiddle(charge.subscription_id), "Próx. renovación", nextRenewal(order, charge) || "—");

    // id completo en pequeño debajo de la última fila, col izquierda
    const leftLabelX = payX + payPad + labelW + 4;
    doc.font("Courier").fontSize(8).fillColor(COLORS.textMuted).text(charge.subscription_id, leftLabelX, doc.y, {
      width: valW,
    });
    doc.fillColor("black");
    doc.moveDown(0.4);
  }

  const payY1 = doc.y + payPad;
  drawCard(doc, payX, payY0, payW, payY1 - payY0);

  // Footer
  doc.moveDown(1.2);
  doc.fontSize(9).fillColor(COLORS.textMuted).text(
    "Este documento es un recibo informativo y no sustituye al CFDI oficial.",
    Lx,
    doc.page.height - doc.page.margins.bottom - 24,
    { width: usableW, align: "center" }
  );

  doc.end();
  const buffer = await done;

  // Nota: Response espera BodyInit; Uint8Array(buffer) funciona en Edge Runtime / Node.
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${order.id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
