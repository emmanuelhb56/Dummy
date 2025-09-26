export type PlanIntervalo = "Semanal" | "Mensual" | "Anual" | "Cada 2 semanas";

export type PlanConektaConfig = {
  interval: "week" | "half_month" | "month" | "year";
  frequency: number;
  trial_period_days?: number;
  amountCents?: number;
};

export type SubscriptionPlan = {
  ref: string;
  planId: string;
  sku: string;
  nombre: string;
  intervalo: PlanIntervalo;
  montoMXN: number;
  popular?: boolean;
  badge?: string;
  conekta: PlanConektaConfig;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    ref: "PLANMENSUALPBA7",
    planId: "PLANMENSUALPBA7",
    sku: "plan-mensual-pba7",
    nombre: "Plan mensual con 7 días de prueba",
    intervalo: "Mensual",
    montoMXN: 300,
    badge: "Prueba 7 días",
    conekta: {
      interval: "month",
      frequency: 1,
      trial_period_days: 7,
    },
  },
  {
    ref: "PLANMENSUAL",
    planId: "PLANMENSUAL",
    sku: "plan-mensual-ilimitado",
    nombre: "Plan mensual ilimitado",
    intervalo: "Mensual",
    montoMXN: 400,
    popular: true,
    conekta: {
      interval: "month",
      frequency: 1,
    },
  },
  {
    ref: "PLANANUAL",
    planId: "PLANANUAL",
    sku: "plan-anual",
    nombre: "Plan anual unico",
    intervalo: "Anual",
    montoMXN: 3000,
    badge: "Ahorra 20%",
    conekta: {
      interval: "year",
      frequency: 1,
    },
  },
  {
    ref: "PLANMENSUAL12",
    planId: "PLANMENSUAL12",
    sku: "plan-anual-mensual",
    nombre: "Plan anual dividido en meses",
    intervalo: "Mensual",
    montoMXN: 1800,
    badge: "Pago mensual de anual",
    conekta: {
      interval: "month",
      frequency: 1,
    },
  },
  {
    ref: "PLANSEMANAL4",
    planId: "PLANSEMANAL4",
    sku: "plan-semanal",
    nombre: "Plan semanal de prueba",
    intervalo: "Semanal",
    montoMXN: 100,
    conekta: {
      interval: "week",
      frequency: 1,
    },
  },
  {
    ref: "PLANQUINCENAL",
    planId: "PLANQUINCENAL",
    sku: "plan-quincenal",
    nombre: "Planquincenal",
    intervalo: "Cada 2 semanas",
    montoMXN: 250,
    conekta: {
      interval: "half_month",
      frequency: 1,
    },
  },
];

export const PLAN_ID_BY_REF = SUBSCRIPTION_PLANS.reduce<Record<string, string>>((acc, plan) => {
  acc[plan.ref] = plan.planId;
  return acc;
}, {});

export function findPlanByRef(ref?: string | null) {
  if (!ref) return undefined;
  return SUBSCRIPTION_PLANS.find((plan) => plan.ref === ref);
}

export function findPlanById(planId?: string | null) {
  if (!planId) return undefined;
  return SUBSCRIPTION_PLANS.find((plan) => plan.planId === planId);
}
