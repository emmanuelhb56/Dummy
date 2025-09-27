"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Calendar,
  Hash,
  FileDown,
  Repeat,
  Package,
  Clock,
  Receipt,
  Activity,
  Mail,
  PauseCircle,
  Ban,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  Album,
  TicketPercent,
  ChevronLeft,
  CircleUserRound,
} from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types/facturacion";

/* ============== Status maps ============== */
const orderStatusMap: Record<
  string,
  {
    label: string;
    description: string;
    color:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning";
  }
> = {
  paid: { label: "Pagado", description: "El cliente completó el pago", color: "success" },
  pending_payment: { label: "Pendiente de pago", description: "Orden pendiente", color: "warning" },
  declined: { label: "Rechazado", description: "El pago fue rechazado", color: "destructive" },
  canceled: { label: "Cancelado", description: "La orden fue cancelada", color: "secondary" },
  expired: { label: "Expirado", description: "La orden ya no es válida", color: "secondary" },

  "order.paid": { label: "Pagado", description: "El cliente completó el pago", color: "success" },
  "order.pending_payment": { label: "Pendiente de pago", description: "Orden pendiente", color: "warning" },
  "order.declined": { label: "Rechazado", description: "El pago fue rechazado", color: "destructive" },
  "order.canceled": { label: "Cancelado", description: "La orden fue cancelada", color: "secondary" },
  "order.expired": { label: "Expirado", description: "La orden ya no es válida", color: "secondary" },
};

const subStatusMap: Record<
  string,
  {
    label: string;
    badge:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | "success"
      | "warning";
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  in_trial: { label: "En prueba", badge: "warning", Icon: Clock },
  active: { label: "Activa", badge: "success", Icon: CheckCircle2 },
  paused: { label: "Pausada", badge: "secondary", Icon: PauseCircle },
  canceled: { label: "Cancelada", badge: "destructive", Icon: Ban },
  past_due: { label: "Pago vencido", badge: "warning", Icon: AlertCircle },
};
function resolveSubStatus(status?: string) {
  if (!status)
    return { label: "—", badge: "outline" as const, Icon: AlertCircle };
  return (
    subStatusMap[status] ?? {
      label: status.replace(/_/g, " "),
      badge: "outline" as const,
      Icon: AlertCircle,
    }
  );
}

/* ============== Helpers ============== */
function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(amount / 100);
}
function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}
function addOneMonth(ts: number) {
  const d = new Date(ts * 1000);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
}
function computeNextRenewal(order: Order): string | null {
  const charge = order.charges?.data?.[0];
  if (!charge?.subscription_id) return null;
  const baseTs = charge.paid_at ?? order.created_at;
  return addOneMonth(baseTs);
}
type LineItemMini = { name?: string | null; description?: string | null };

function getConceptLabel(order: Order): string {
  const charge = order.charges?.data?.[0];
  const li = (order.line_items?.data?.[0] as LineItemMini | undefined) ?? undefined;

  return (
    charge?.description ||
    (li?.name && li.name.toLowerCase() !== "default" ? li.name : "") ||
    "Suscripción"
  );
}

/* ============== Types ============== */
type Subscription = {
  id: string;
  status?: string;
  plan_id?: string;
  trial_end?: number | null;
  billing_cycle_start?: number | null;
  billing_cycle_end?: number | null;
  last_billing_cycle_order_id?: string | null;
};

export default function FacturacionView({
  orders,
  subscriptions = [],
  customerName,
  customerEmail,
  customerId,
  customerPhone,
}: {
  orders: Order[];
  subscriptions?: Subscription[];
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  customerPhone?: string;
}) {
  /* --------- Small reusable header component --------- */
  const SectionHeader = ({
    icon,
    title,
    subtitle,
    action,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-8 space-y-10">

      {/* ===== Page header (global) ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
         <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:underline">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
            Inicio
          </Link>
        </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Album className="h-6 w-6 text-slate-500" />
          <h1 className="text-lg font-bold text-slate-900">Historial de facturación</h1>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Consulta tus datos de cliente, suscripciones activas y comprobantes de pago.
        </p>

        {/* ===== Datos del cliente (2×2) ===== */}
        <SectionHeader
          icon={<User className="h-5 w-5 text-slate-500" />}
          title="Datos del cliente"
          subtitle="Información básica de contacto y tu identificador en el sistema"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <CircleUserRound className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Cliente</p>
              <p className="font-medium">{customerName || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-500" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Correo</p>
              <p className="font-medium truncate">{customerEmail || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-slate-500" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">ID Cliente</p>
              <p className="font-mono text-sm break-all">{customerId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Teléfono</p>
              <p className="font-medium">{customerPhone || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Suscripciones ===== */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <SectionHeader
          icon={<Activity className="h-5 w-5 text-slate-500" />}
          title="Suscripciones"
          subtitle="Planes activos, prueba y estado de ciclo"
        />
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {subscriptions.map((s) => {
              const { label, badge, Icon } = resolveSubStatus(s.status);
              return (
                <Card key={s.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <TicketPercent className="h-4 w-4 text-slate-500" />
                        <span className="truncate">{s.plan_id || "Plan sin nombre"}</span>
                      </div>
                      <Badge variant={badge} className="flex items-center gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs">{label}</span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700 space-y-2">
                    {s.trial_end && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="font-medium">Fin de prueba</p>
                          <p>{new Date(s.trial_end * 1000).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</p>
                        </div>
                      </div>
                    )}
                    {s.billing_cycle_start && s.billing_cycle_end && (
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="font-medium">Ciclo actual</p>
                          <p>
                            {new Date(s.billing_cycle_start * 1000).toLocaleDateString("es-MX")} —{" "}
                            {new Date(s.billing_cycle_end * 1000).toLocaleDateString("es-MX")}
                          </p>
                        </div>
                      </div>
                    )}
                    {s.last_billing_cycle_order_id && (
                      <p className="text-xs text-slate-500">Última orden: {s.last_billing_cycle_order_id}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hay suscripciones registradas.</p>
        )}
      </div>

      {/* ===== Órdenes ===== */}
      <div className="rounded-xl border bg-white shadow-sm p-6">
        <SectionHeader
          icon={<Package className="h-5 w-5 text-slate-500" />}
          title="Órdenes"
          subtitle="Pagos realizados y próximos cobros automáticos"
        />
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">No hay órdenes registradas para este cliente.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const statusInfo =
                orderStatusMap[order.payment_status] ||
                orderStatusMap[`order.${order.payment_status}`] || {
                  label: "Desconocido",
                  description: "Estado no identificado",
                  color: "outline" as const,
                };

              const charge = order.charges?.data?.[0];
              const metodo =
                (charge?.payment_method?.brand
                  ? `${String(charge.payment_method.brand).toUpperCase()} ••••${charge.payment_method.last4 || ""}`
                  : charge?.payment_method?.service_name || charge?.payment_method?.type) || "—";

              const nextRenewal = computeNextRenewal(order);
              const concept = getConceptLabel(order);

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <span className="truncate">Orden {order.id}</span>
                    </CardTitle>
                    <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                  </CardHeader>

                  <CardContent>
                    {/* Monto + concepto */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                      <p className="text-lg font-bold">
                        {formatAmount(order.amount, order.currency)}
                      </p>
                      <p className="text-xs text-slate-500 sm:text-right">{concept}</p>
                    </div>

                    <Separator className="my-3" />

                    {/* Fechas */}
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="font-medium">Fecha de pago</p>
                          <p>{formatDate(charge?.paid_at ?? order.created_at)}</p>
                        </div>
                      </div>

                      {nextRenewal && (
                        <div className="flex items-center gap-2">
                          <Repeat className="h-4 w-4 text-slate-500" />
                          <div>
                            <p className="font-medium">Próxima renovación</p>
                            <p>{nextRenewal}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Método + Suscripción */}
                    {charge && (
                      <div className="mt-3 text-sm text-slate-700 grid gap-2 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-slate-500" />
                          <div className="truncate">
                            <p className="font-medium leading-none">Método de pago</p>
                            <p className="truncate">{metodo}</p>
                          </div>
                        </div>

                        {charge.subscription_id && (
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-slate-500" />
                            <div className="truncate">
                              <p className="font-medium leading-none">Suscripción</p>
                              <p className="truncate">{charge.subscription_id}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/recibo/${order.id}`} target="_blank" rel="noopener noreferrer">
                          <FileDown className="h-4 w-4 mr-2" />
                          Descargar recibo (PDF)
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
