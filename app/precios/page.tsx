"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";

// MUI
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";
import Slide from "@mui/material/Slide";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Snackbar from "@mui/material/Snackbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Forms
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Icons (lucide-react)
import {
  ArrowLeft as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  User2,
  FileText,
  Mail,
  Phone,
  Building2,
  MapPin,
  Landmark,
  Hash,
  Calendar,
  ShieldCheck,
} from "lucide-react";

/* ===================== Utils ===================== */
const YEARLY_DISCOUNT = 0.2;
const fmt = (n: number) => n.toLocaleString("es-MX");

function normalizePhoneMX(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  const national10 = digits.replace(/^52/, "").slice(-10);
  if (national10.length === 10) return `+52${national10}`;
  return `+${digits}`;
}
function isValidPhoneMX(raw: string): boolean {
  const digits = (raw || "").replace(/\D/g, "").replace(/^52/, "");
  return digits.length === 10;
}

/* ===================== Planes ===================== */
const PLAN_ID_BY_REF: Record<string, string> = {
  PLANMENSUALPBA7: "PLANMENSUALPBA7",
  PLANANUAL: "PLANANUAL",
  PLANSEMANAL4: "PLANSEMANAL4",
  PLANMENSUAL: "PLANMENSUAL",
  PLANQUINCENAL: "PLANQUINCENAL",
  PLANMENSUAL12: "PLANMENSUAL12",
};

type SubPlan = {
  nombre: string;
  referencia: keyof typeof PLAN_ID_BY_REF | string;
  intervalo: "Semanal" | "Mensual" | "Anual" | "Cada 2 semanas";
  montoMXN: number;
  popular?: boolean;
  badge?: string;
};

const SUBSCRIPCIONES: SubPlan[] = [
  { nombre: "Plan mensual con 7 días de prueba", referencia: "PLANMENSUALPBA7", intervalo: "Mensual", montoMXN: 300, badge: "Prueba 7 días" },
  { nombre: "Plan mensual ilimitado", referencia: "PLANMENSUAL", intervalo: "Mensual", montoMXN: 400, popular: true },
  { nombre: "Plan anual único", referencia: "PLANANUAL", intervalo: "Anual", montoMXN: 3000, badge: "Ahorra 20%" },
  { nombre: "Plan anual dividido en meses", referencia: "PLANMENSUAL12", intervalo: "Mensual", montoMXN: 1800, badge: "Pago mensual de anual" },
  { nombre: "Plan semanal de prueba", referencia: "PLANSEMANAL4", intervalo: "Semanal", montoMXN: 100 },
  { nombre: "Plan quincenal", referencia: "PLANQUINCENAL", intervalo: "Cada 2 semanas", montoMXN: 250 },
];

/* ===================== Zod + RHF ===================== */
const Schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(7, "Teléfono requerido").refine((v) => isValidPhoneMX(normalizePhoneMX(v)), "Usa 10 dígitos MX; se antepone +52 automáticamente"),
  empresas: z.number().int().min(1, "Mínimo 1").max(999, "Demasiado alto"),
  addressLine1: z.string().min(5, "Calle y número requeridos"),
  addressLine2: z.string().optional(),
  postalCode: z.string().min(5, "CP requerido"),
  country: z.string().min(2, "País requerido"),
  state: z.string().min(2, "Estado requerido"),
  city: z.string().min(2, "Ciudad requerida"),
  cardNumber: z.string().min(12, "Número de tarjeta requerido").optional(),
  expMonth: z.string().min(1, "Mes requerido").optional(),
  expYear: z.string().min(2, "Año requerido").optional(),
  cvc: z.string().min(3, "CVC requerido").optional(),
  chosenTitle: z.string().optional(),
  chosenPlanRef: z.string().nullable().optional(),
  chosenIntervalo: z.string().optional(),
  chosenBase: z.number().optional(),
});
type FormValues = z.infer<typeof Schema>;
type FieldName = keyof FormValues;

type StepKey = "contacto" | "facturacion" | "tarjeta" | "resumen" | "ok";
const STEPS: { key: StepKey; title: string }[] = [
  { key: "contacto", title: "Contacto" },
  { key: "facturacion", title: "Facturación" },
  { key: "tarjeta", title: "Tarjeta" },
  { key: "resumen", title: "Resumen" },
  { key: "ok", title: "Listo" },
];

/* ===================== Page ===================== */
export default function PreciosPage() {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [periodo, setPeriodo] = useState<"Mensual" | "Anual">("Mensual");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<StepKey>("contacto");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ customer_id?: string; subscription_id?: string; display?: unknown; error?: string } | null>(null);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const { register, setValue, getValues, watch, trigger, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: "", email: "", phone: "", empresas: 1,
      addressLine1: "", addressLine2: "", postalCode: "", country: "MX", state: "", city: "",
      cardNumber: "", expMonth: "", expYear: "", cvc: "",
      chosenTitle: "", chosenPlanRef: null, chosenIntervalo: "", chosenBase: 0,
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const visibles = useMemo(() => SUBSCRIPCIONES.filter(s => s.intervalo === periodo), [periodo]);
  const otros = useMemo(() => SUBSCRIPCIONES.filter(s => s.intervalo !== periodo && (s.intervalo === "Semanal" || s.intervalo === "Cada 2 semanas")), [periodo]);

  const empresas = watch("empresas");
  const chosenBase = watch("chosenBase");
  const chosenAmount = Math.max(1, Number(empresas || 1)) * Number(chosenBase || 0);

  function abrirModalParaSuscripcion(s: SubPlan) {
    setValue("chosenTitle", s.nombre);
    setValue("chosenPlanRef", s.referencia);
    setValue("chosenIntervalo", s.intervalo);
    setValue("chosenBase", s.montoMXN);
    setValue("empresas", 1);
    setDialogOpen(true);
    setCurrent("contacto");
    setResult(null);
  }

  const stepFields: Record<Exclude<StepKey, "ok" | "resumen">, FieldName[]> = {
    contacto: ["name", "email", "phone", "empresas"],
    facturacion: ["addressLine1", "postalCode", "country", "state", "city"],
    tarjeta: ["cardNumber", "expMonth", "expYear", "cvc"],
  } as const;

  async function goNext() {
    if (current === "ok") return;
    if (current === "resumen") { setCurrent("ok"); return; }
    const fields = stepFields[current as keyof typeof stepFields];
    const valid = await trigger(fields as unknown as FieldName[]);
    if (!valid) return;

    if (current === "contacto") {
      const normalized = normalizePhoneMX(getValues("phone") || "");
      if (isValidPhoneMX(normalized)) setValue("phone", normalized);
    }

    const order: StepKey[] = ["contacto", "facturacion", "tarjeta", "resumen", "ok"];
    const idx = order.indexOf(current);
    setCurrent(order[Math.min(idx + 1, order.length - 1)]);
  }
  function goPrev() {
    const order: StepKey[] = ["contacto", "facturacion", "tarjeta", "resumen", "ok"];
    const idx = order.indexOf(current);
    setCurrent(order[Math.max(idx - 1, 0)]);
  }

  // Cerrar + resetear todo
  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setCurrent("contacto");
    setResult(null);
    window.__CON_TOKEN__ = undefined;
    reset({
      name: "",
      email: "",
      phone: "",
      empresas: 1,
      addressLine1: "",
      addressLine2: "",
      postalCode: "",
      country: "MX",
      state: "",
      city: "",
      cardNumber: "",
      expMonth: "",
      expYear: "",
      cvc: "",
      chosenTitle: "",
      chosenPlanRef: null,
      chosenIntervalo: "",
      chosenBase: 0,
    });
  }, [reset]);

  async function tokenizarTarjeta() {
    const ok = await trigger(stepFields.tarjeta as unknown as FieldName[]);
    if (!ok) return;

    const v = getValues();
    const ConektaJS = window.Conekta;
    if (!ConektaJS) { setToast({ open: true, msg: "Tokenizer no cargó. Revisa CSP y NEXT_PUBLIC_CONEKTA_PUBLIC_KEY." }); return; }
    ConektaJS.setPublicKey(process.env.NEXT_PUBLIC_CONEKTA_PUBLIC_KEY);

    try {
      const token = await new Promise<{ id: string }>((resolve, reject) => {
        ConektaJS.Token.create(
          {
            card: {
              number: String(v.cardNumber ?? "").replace(/\s+/g, ""),
              name: v.name,
              exp_month: String(v.expMonth ?? ""),
              exp_year: String(v.expYear ?? ""),
              cvc: String(v.cvc ?? ""),
              address_line1: v.addressLine1,
              address_line2: v.addressLine2 || "",
              postal_code: v.postalCode,
              country: v.country,
              state: v.state,
              city: v.city,
            },
          },
          (tok) => resolve({ id: tok.id }),
          (err) => reject(new Error(err?.message || "No se pudo tokenizar"))
        );
      });
      window.__CON_TOKEN__ = token.id;
      setCurrent("resumen");
    } catch (e) {
      const msg = (e as { message?: string }).message || "No se pudo tokenizar";
      setToast({ open: true, msg });
    }
  }

  async function confirmarSuscripcion() {
    const v = getValues();
    const tokenId = window.__CON_TOKEN__;
    if (!tokenId) { setToast({ open: true, msg: "Falta token de tarjeta." }); return; }

    setSubmitting(true);
    setResult(null);

    try {
      const plan_id = PLAN_ID_BY_REF[v.chosenPlanRef || ""] ?? v.chosenPlanRef;
      if (!plan_id) { setSubmitting(false); return setToast({ open: true, msg: "Plan inválido (revisa PLAN_ID_BY_REF)." }); }

      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name,
          email: v.email,
          phone: v.phone,
          token_id: tokenId,
          plan_id,
          empresas: Number(v.empresas || 1),
          planRef: v.chosenPlanRef,
          intervalo: v.chosenIntervalo,
          address: {
            line1: v.addressLine1,
            line2: v.addressLine2 || "",
            postalCode: v.postalCode,
            country: v.country,
            state: v.state,
            city: v.city,
          },
          metadata: { chosenBase: v.chosenBase, chosenAmount, chosenTitle: v.chosenTitle },
        }),
      });

      const data: {
        customer_id?: string;
        subscription_ids?: string[];
        subscription_id?: string;
        display?: unknown;
        error?: string;
        message?: string;
      } = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || data?.error || "Suscripción fallida";
        setResult({ error: msg });
        setToast({ open: true, msg });
        return;
      }

      setResult({
        customer_id: data.customer_id,
        subscription_id: Array.isArray(data.subscription_ids) ? data.subscription_ids.join(", ") : data.subscription_id,
        display: data.display,
      });
      setCurrent("ok");
    } catch (e) {
      const msg = (e as { message?: string }).message || "Error de red";
      setResult({ error: msg });
      setToast({ open: true, msg });
    } finally {
      setSubmitting(false);
    }
  }

  /* ========= CONFETTI: carga UMD y crea canvas por encima del Dialog ========= */
  useEffect(() => {
    if (window.__CONFETTI_FN__) return;

    function loadScript(src: string) {
      return new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("No se pudo cargar confetti"));
        document.head.appendChild(s);
      });
    }

    (async () => {
      if (!window.confetti) {
        try {
          await loadScript("https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js");
        } catch {
          return;
        }
      }
      if (!window.confetti) return;

      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "2147483647";
      document.body.appendChild(canvas);

      const fn = window.confetti.create(canvas, { resize: true, useWorker: true });
      window.__CONFETTI_CANVAS__ = canvas;
      window.__CONFETTI_FN__ = fn;

      const cleanup = () => {
        try { canvas.remove(); } catch { /* noop */ }
        window.__CONFETTI_CANVAS__ = undefined;
        window.__CONFETTI_FN__ = undefined;
      };
      window.addEventListener("beforeunload", cleanup);
    })();
  }, []);

  // Disparo + autocierre tras éxito
  useEffect(() => {
    if (current === "ok" && result && !result.error) {
      const fn = window.__CONFETTI_FN__;
      if (fn) {
        fn({ particleCount: 180, spread: 75, origin: { y: 0.6 } });
        setTimeout(() => fn({ particleCount: 120, spread: 65, scalar: 0.9, origin: { y: 0.7 } }), 250);
      }
      const t = setTimeout(() => handleClose(), 4500);
      return () => clearTimeout(t);
    }
  }, [current, result, handleClose]);

  /* ---------- UI helpers ---------- */
  const activeIndex = STEPS.findIndex((s) => s.key === current);

  const StepIcon = ({ active, completed, icon }: { active: boolean; completed: boolean; icon: number }) => {
    const common = { width: 28, height: 28 };
    const color = completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.text.disabled;
    const bg = completed ? theme.palette.success.light : active ? theme.palette.primary.light : theme.palette.action.hover;
    const map: Record<string, JSX.Element> = {
      "1": <User2 size={16} />,
      "2": <FileText size={16} />,
      "3": <CreditCardIcon size={16} />,
      "4": <ShieldCheck size={16} />,
      "5": <CheckCircleIcon size={16} />,
    };
    return (
      <Box sx={{ ...common, borderRadius: "999px", bgcolor: bg, color, display: "grid", placeItems: "center", border: `1px solid ${completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.divider}` }}>
        {map[String(icon)]}
      </Box>
    );
  };

  function HeaderSticky() {
    return (
      <Box borderBottom={1} borderColor="divider" sx={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(6px)", bgcolor: "background.paper" }}>
        <Container maxWidth="lg" sx={{ py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Link href="/">
              <IconButton size="small"><ArrowBackIcon size={18} /></IconButton>
            </Link>
            <Box>
              <Typography variant="h5" fontWeight={700}>Precios</Typography>
              <Typography variant="body2" color="text.secondary">Planes recurrentes — sin sorpresas</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  function PlanCard({ s }: { s: SubPlan }) {
    return (
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          transition: "transform .2s ease, box-shadow .2s ease",
          "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
          borderColor: s.popular ? "primary.main" : "divider",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              s.popular
                ? `radial-gradient(800px 200px at 0% -10%, ${theme.palette.primary.main}10 0%, transparent 60%)`
                : `radial-gradient(800px 200px at 0% -10%, ${theme.palette.action.hover}60 0%, transparent 60%)`,
          }}
        />
        <CardHeader
          title={s.nombre}
          subheader={`${s.intervalo} • Ref: ${s.referencia}`}
          action={s.badge ? <Chip size="small" label={s.badge} color={s.popular ? "primary" : "default"} /> : null}
          sx={{ pb: 0.5 }}
        />
        <CardContent>
          <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            ${fmt(s.montoMXN)}
            <Typography component="span" variant="subtitle1" color="text.secondary">
              /{s.intervalo === "Anual" ? "año" : s.intervalo === "Mensual" ? "mes" : s.intervalo.toLowerCase()}
            </Typography>
          </Typography>
          {s.intervalo === "Anual" && (
            <Typography variant="caption" color="text.secondary">Equivale a ${fmt(Math.round(s.montoMXN / 12))} / mes aprox.</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Stack component="ul" spacing={1} sx={{ m: 0, pl: 2 }}>
            {["Contabilidad básica", "Facturación electrónica", "Inventarios", "Soporte estándar"].map((f) => (
              <li key={f}>
                <Typography variant="body2" color="text.secondary">{f}</Typography>
              </li>
            ))}
          </Stack>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button fullWidth variant="contained" onClick={() => abrirModalParaSuscripcion(s)}>
            Suscribirme {s.intervalo === "Anual" ? "(anual)" : "(mensual)"}
          </Button>
        </CardActions>
      </Card>
    );
  }

  /* ====== Listado SIMPLE ====== */
  function OrderCardSimple({
    title, refCode, unit, qty,
  }: {
    title: string;
    refCode: string;
    unit: number;
    qty: number;
  }) {
    const line = unit * qty;
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack spacing={1.2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
            <Chip size="small" label="Suscripción" color="success" variant="outlined" />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" label={`Ref: ${refCode}`} variant="outlined" />
            <Chip size="small" label={`Cantidad: ${qty}`} variant="outlined" />
          </Stack>

          <Divider />

          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Precio / unidad</Typography>
            <Typography fontWeight={700}>${unit.toLocaleString("es-MX")} MXN</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography color="text.secondary">Total</Typography>
            <Typography fontWeight={800}>${line.toLocaleString("es-MX")} MXN</Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }
  /* ====== /Listado SIMPLE ====== */

  function DialogStepperHeader() {
    return (
      <Box px={3} pt={2} pb={1} borderBottom={1} borderColor="divider" sx={{ position: "sticky", top: 0, zIndex: 2, bgcolor: "background.paper" }}>
        <DialogTitle sx={{ p: 0 }}>Confirmar suscripción</DialogTitle>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {watch("chosenTitle")} • {watch("chosenIntervalo")} • Ref: {String(watch("chosenPlanRef") || "")}
        </Typography>
        <Box mt={2}>
          <Stepper activeStep={activeIndex} alternativeLabel>
            {STEPS.map((s) => (
              <Step key={s.key}>
                <StepLabel StepIconComponent={StepIcon as unknown as React.FC}>{s.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>
    );
  }

  function StickyFooter({ children }: { children: React.ReactNode }) {
    const empresasSel = watch("empresas");
    const base = watch("chosenBase");
    const total = Math.max(1, Number(empresasSel || 1)) * Number(base || 0);
    return (
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          bottom: 0,
          mt: 2,
          borderRadius: 2,
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.paper",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">Total</Typography>
          <Typography fontWeight={700}>${fmt(total)} MXN</Typography>
          <Typography variant="caption" color="text.secondary">
            ${fmt(Number(base || 0))} x {empresasSel} empresa(s)
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {current !== "contacto" && current !== "ok" && (
            <Button variant="outlined" startIcon={<ChevronLeftIcon size={16} />} onClick={goPrev}>
              Atrás
            </Button>
          )}
          {children}
        </Stack>
      </Paper>
    );
  }

  function RHFText({
    name, label, placeholder, type = "text", inputMode, icon,
  }: {
    name: FieldName;
    label: string;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    icon?: JSX.Element;
  }) {
    const fieldErrors = errors as FieldErrors<FormValues>;
    const errMsg = fieldErrors[name]?.message as string | undefined;

    return (
      <TextField
        label={label}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        size="small"
        fullWidth
        error={!!errMsg}
        helperText={errMsg}
        InputProps={{
          startAdornment: icon ? <InputAdornment position="start">{icon}</InputAdornment> : undefined,
        }}
        {...register(name, name === "empresas" ? { valueAsNumber: true } : undefined)}
      />
    );
  }

  return (
    <Box>
      {/* Conekta */}
      <Script src="https://cdn.conekta.io/js/latest/conekta.js" strategy="afterInteractive" />

      {/* Header */}
      <HeaderSticky />

      {/* Toggle periodo */}
      <Container maxWidth="md" sx={{ py: 5, textAlign: "center" }}>
        <Box display="inline-flex" gap={0.5} p={0.5} borderRadius={999} sx={{ bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}`, boxShadow: 1 }}>
          {["Mensual", "Anual"].map((p) => {
            const active = periodo === (p as "Mensual" | "Anual");
            return (
              <Button
                key={p}
                size="small"
                variant={active ? "contained" : "text"}
                onClick={() => setPeriodo(p as "Mensual" | "Anual")}
                sx={{ borderRadius: 999, px: 2, fontWeight: 700 }}
              >
                {p}
                {p === "Anual" && <Chip size="small" label={`Ahorra ${Math.round(YEARLY_DISCOUNT * 100)}%`} sx={{ ml: 1 }} />}
              </Button>
            );
          })}
        </Box>
      </Container>

      {/* Planes */}
      <Container maxWidth="lg" sx={{ pb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {visibles.map((s) => (
            <Box key={s.referencia} sx={{ flex: 1, minWidth: 0 }}>
              <PlanCard s={s} />
            </Box>
          ))}
        </Stack>
      </Container>

      {/* Otros periodos */}
      {otros.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Otros periodos</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {otros.map((s) => (
              <Box key={s.referencia} sx={{ flex: 1, minWidth: 0 }}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardHeader titleTypographyProps={{ variant: "h6" }} title={s.nombre} subheader={`${s.intervalo} • Ref: ${s.referencia}`} />
                  <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6">${fmt(s.montoMXN)}</Typography>
                    <Button variant="contained" onClick={() => abrirModalParaSuscripcion(s)}>Suscribirme</Button>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        </Container>
      )}

      {/* Dialog */}
      <Dialog fullWidth maxWidth="md" fullScreen={fullScreen} open={dialogOpen} onClose={handleClose}>
        <DialogStepperHeader />

        <DialogContent sx={{ pt: 3 }}>
          {/* Contacto */}
          {current === "contacto" && (
            <>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFText name="name" label="Nombre" placeholder="Nombre y apellidos" icon={<User2 size={16} />} />
                  <RHFText name="phone" label="Teléfono" placeholder="+52 55 1234 5678" inputMode="tel" icon={<Phone size={16} />} />
                </Stack>
                <RHFText name="email" label="Email" placeholder="correo@dominio.com" type="email" icon={<Mail size={16} />} />
                <TextField
                  label="Empresas / Sucursales"
                  fullWidth
                  size="small"
                  select
                  SelectProps={{ native: true }}
                  error={!!(errors as FieldErrors<FormValues>)["empresas"]}
                  helperText={(errors as FieldErrors<FormValues>)["empresas"]?.message as string | undefined}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Building2 size={16} /></InputAdornment> }}
                  {...register("empresas", { valueAsNumber: true })}
                >
                  {[1,2,3,5,10].map(n => <option key={n} value={n}>{n}</option>)}
                </TextField>
              </Stack>

              <StickyFooter>
                <Button variant="contained" endIcon={<ChevronRightIcon size={16} />} onClick={goNext}>Continuar</Button>
              </StickyFooter>
            </>
          )}

          {/* Facturación */}
          {current === "facturacion" && (
            <>
              <Stack spacing={2}>
                <RHFText name="addressLine1" label="Calle y número" placeholder="Av. Siempre Viva 742" icon={<Landmark size={16} />} />
                <RHFText name="addressLine2" label="Colonia / Interior (opcional)" placeholder="Depto 3, Col. Centro" icon={<Building2 size={16} />} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFText name="postalCode" label="Código Postal" placeholder="01234" icon={<Hash size={16} />} />
                  <RHFText name="state" label="Estado" placeholder="CDMX" icon={<MapPin size={16} />} />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFText name="city" label="Ciudad" placeholder="Ciudad de México" icon={<MapPin size={16} />} />
                  <RHFText name="country" label="País" placeholder="MX" icon={<MapPin size={16} />} />
                </Stack>
              </Stack>

              <StickyFooter>
                <Button startIcon={<ChevronLeftIcon size={16} />} onClick={goPrev}>Atrás</Button>
                <Button variant="contained" endIcon={<ChevronRightIcon size={16} />} onClick={goNext}>Continuar</Button>
              </StickyFooter>
            </>
          )}

          {/* Tarjeta */}
          {current === "tarjeta" && (
            <>
              <Stack spacing={2}>
                <RHFText name="cardNumber" label="Número de tarjeta" placeholder="4242 4242 4242 4242" icon={<CreditCardIcon size={16} />} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <RHFText name="expMonth" label="Mes" placeholder="12" icon={<Calendar size={16} />} />
                  <RHFText name="expYear" label="Año" placeholder="29" icon={<Calendar size={16} />} />
                </Stack>
                <RHFText name="cvc" label="CVC" placeholder="123" icon={<ShieldCheck size={16} />} />
                <Typography variant="caption" color="text.secondary">Tu tarjeta se tokeniza de forma segura en tu navegador mediante Conekta.</Typography>
              </Stack>

              <StickyFooter>
                <Button startIcon={<ChevronLeftIcon size={16} />} onClick={goPrev}>Atrás</Button>
                <Button variant="contained" onClick={tokenizarTarjeta}>Continuar</Button>
              </StickyFooter>
            </>
          )}

          {/* Resumen */}
          {current === "resumen" && (
            <>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {/* Col izquierda */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: 1, bgcolor: "action.hover" }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Resumen</Typography>
                  <Stack spacing={1.2}>
                    <Box>
                      <Typography variant="overline" color="text.secondary">Plan</Typography>
                      <Typography variant="body2">
                        {watch("chosenTitle")} • {watch("chosenIntervalo")} • Ref: {String(watch("chosenPlanRef") || "")}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="overline" color="text.secondary">Cliente</Typography>
                      <Typography variant="body2">
                        {watch("name")} — {watch("email")} — {normalizePhoneMX(watch("phone") || "")}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="overline" color="text.secondary">Dirección</Typography>
                      <Typography variant="body2">
                        {watch("addressLine1")}{watch("addressLine2") ? `, ${watch("addressLine2")}` : ""}, {watch("city")}, {watch("state")}, {watch("postalCode")}, {watch("country")}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Derecha: listado simple */}
                <Box sx={{ flex: 1 }}>
                  <OrderCardSimple
                    title={watch("chosenTitle") || "Suscripción"}
                    refCode={String(watch("chosenPlanRef") || PLAN_ID_BY_REF[watch("chosenPlanRef") || ""] || "SKU")}
                    unit={Number(watch("chosenBase") || 0)}
                    qty={Number(watch("empresas") || 1)}
                  />
                </Box>
              </Stack>

              <StickyFooter>
                <Button startIcon={<ChevronLeftIcon size={16} />} onClick={goPrev}>Atrás</Button>
                <Button variant="contained" disabled={submitting} onClick={confirmarSuscripcion}>
                  {submitting ? "Creando suscripción..." : "Confirmar suscripción"}
                </Button>
              </StickyFooter>
            </>
          )}

          {/* Ok */}
          {current === "ok" && (
            <Fade in timeout={600}>
              <Stack spacing={2}>
                <Grow in timeout={700}>
                  <Alert
                    severity={result?.error ? "error" : "success"}
                    variant="outlined"
                    sx={{ borderRadius: 3 }}
                  >
                    <AlertTitle>
                      {result?.error ? "Ocurrió un error" : "¡Suscripción creada correctamente!"}
                    </AlertTitle>
                    {result?.error || "Tu suscripción se generó correctamente. Debajo verás los detalles."}
                  </Alert>
                </Grow>

                {(() => {
                  const d = result?.display as
                    | { items?: Array<{ title?: string; name?: string; sku?: string; unitAmount?: number; quantity?: number }> }
                    | undefined;
                  const item = d?.items?.[0];
                  return (
                    <Slide direction="up" in timeout={700}>
                      <div>
                        <OrderCardSimple
                          title={item?.title || item?.name || watch("chosenTitle") || "Suscripción"}
                          refCode={item?.sku || String(watch("chosenPlanRef") || "SKU")}
                          unit={Number(item?.unitAmount ?? watch("chosenBase") ?? 0)}
                          qty={Number(item?.quantity ?? watch("empresas") ?? 1)}
                        />
                      </div>
                    </Slide>
                  );
                })()}

                {!result?.error && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Typography variant="overline" color="text.secondary">Identificadores</Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        Customer: {result?.customer_id}
                      </Typography>
                      {String(result?.subscription_id ?? "")
                        .split(",")
                        .filter(Boolean)
                        .map((id, i) => (
                          <Typography key={i} variant="body2" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                            Subscription {i + 1}: {id.trim()}
                          </Typography>
                        ))}
                    </Stack>
                  </Paper>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Button onClick={handleClose} variant="text">Cerrar</Button>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" component={Link as unknown as React.ElementType} href="/panel/facturacion">
                      Ver facturación
                    </Button>
                    <Button variant="contained" component={Link as unknown as React.ElementType} href="/">
                      Ir al inicio
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Fade>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar de errores */}
      <Snackbar
        open={toast.open}
        onClose={() => setToast({ open: false, msg: "" })}
        autoHideDuration={4000}
        message={toast.msg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      <Box height={24} />
    </Box>
  );
}