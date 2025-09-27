"use client";

import { useEffect, useState } from "react";
import FacturacionView from "./FacturacionView";
import { Order } from "@/types/facturacion";

type SearchParams = { customer?: string };

export default function FacturacionPanelPage({ searchParams }: { searchParams: SearchParams }) {
  const customerId = searchParams?.customer;
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState<string | undefined>();
  const [customerEmail, setCustomerEmail] = useState<string | undefined>();
  const [customerPhone, setCustomerPhone] = useState<string | undefined>();
  const [subs, setSubs] = useState<
    { id: string; status?: string; plan_id?: string; trial_end?: number | null; billing_cycle_start?: number | null; billing_cycle_end?: number | null; last_billing_cycle_order_id?: string | null; }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;
    (async () => {
      try {
        const resp = await fetch(`/api/facturacion?customer=${customerId}`);
        if (!resp.ok) throw new Error(await resp.text());
        const json: {
          orders?: Order[];
          customer?: { name?: string; email?: string; phone?: string };
          subscriptions?: typeof subs;
        } = await resp.json();

        setOrders(Array.isArray(json.orders) ? json.orders : []);
        setCustomerName(json.customer?.name);
        setCustomerEmail(json.customer?.email);
        setCustomerPhone(json.customer?.phone);
        setSubs(Array.isArray(json.subscriptions) ? json.subscriptions : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Error al cargar órdenes";
        setError(msg);
      }
    })();
  }, [customerId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!customerId) return <p>Falta el parámetro <code>customer</code></p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <FacturacionView
      orders={orders}
      subscriptions={subs}
      customerId={customerId}
      customerName={customerName}
      customerEmail={customerEmail}
      customerPhone={customerPhone}
    />
  );
}