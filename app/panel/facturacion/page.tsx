"use client";
/* eslint-disable @next/next/no-async-client-component */
import { Buffer } from "buffer";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/GridLegacy";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type SearchParams = {
  customer?: string;
  subs?: string;
};

type SubscriptionPreview = {
  id?: string;
  plan_id?: string;
  status?: string;
  billing_cycle_start?: number | null;
  billing_cycle_end?: number | null;
  created_at?: number | null;
  last_billing_cycle_order_id?: string | null;
  charge_id?: string | null;
  seat?: number;
  error?: string;
};

const formatTimestamp = (value?: number | null) => {
  if (!value) return "—";
  try {
    return new Date(value * 1000).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

async function fetchSubscriptions(ids: string[]): Promise<SubscriptionPreview[]> {
  if (!ids.length) return [];
  const key = process.env.CONEKTA_PRIVATE_KEY;
  if (!key) {
    return ids.map((id) => ({ id, error: "CONEKTA_PRIVATE_KEY no configurada" }));
  }

  const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
  const headers = {
    Authorization: auth,
    Accept: "application/vnd.conekta-v2.2.0+json",
    "Content-Type": "application/json",
    "Accept-Language": "es",
  };

  const results = await Promise.all(
    ids.map(async (id, index) => {
      try {
        const res = await fetch(`https://api.conekta.io/subscriptions/${id}`, {
          method: "GET",
          headers,
          cache: "no-store",
        });

        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          return { id, error: detail?.message || res.statusText, seat: index + 1 };
        }

        const data = (await res.json()) as SubscriptionPreview;
        return { ...data, seat: index + 1 };
      } catch (error) {
        return { id, error: (error as { message?: string }).message ?? "No se pudo obtener la suscripción", seat: index + 1 };
      }
    })
  );

  return results;
}

export default async function FacturacionPanelPage({ searchParams }: { searchParams?: SearchParams }) {
  const customerId = searchParams?.customer;
  const subsParam = searchParams?.subs ?? "";
  const subscriptionIds = subsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const subscriptions = await fetchSubscriptions(subscriptionIds);

  return (
    <Box 
      component="section" 
      sx={{ 
        minHeight: "100vh", 
        py: 8, 
        background: (theme) => theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
        }
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), transparent)",
          filter: "blur(40px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "linear-gradient(45deg, rgba(236, 72, 153, 0.1), transparent)",
          filter: "blur(40px)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          {/* Header mejorado */}
          <Card
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              position: "relative",
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 6 },
              background: (theme) => theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)",
              backdropFilter: "blur(12px)",
              border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)"}`,
              boxShadow: (theme) => theme.palette.mode === "dark"
                ? "0 12px 40px rgba(15, 23, 42, 0.4)"
                : "0 16px 40px rgba(15, 23, 42, 0.08)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems={{ xs: "flex-start", md: "center" }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  color: "#fff",
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  boxShadow: (theme) => theme.shadows[8],
                }}
              >
                <ReceiptLongIcon fontSize="large" />
              </Avatar>
              <Stack spacing={1.5} flex={1}>
                <Chip
                  label="Centro de Facturación"
                  size="small"
                  sx={{
                    alignSelf: { xs: "flex-start", md: "center" },
                    mb: 1,
                    background: (theme) => theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.12)",
                    color: "#1d4ed8",
                    fontWeight: 600,
                    px: 1.75,
                    py: 0.5,
                    letterSpacing: 0.5,
                  }}
                />
                <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: "2.3rem", md: "3rem" }, lineHeight: 1.1 }}>
                  Facturación y Recibos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: "1.05rem", md: "1.15rem" }, maxWidth: "640px" }}>
                  Revisa los folios generados después de confirmar tu suscripción. Estos comprobantes son válidos mientras generamos tu CFDI oficial.
                </Typography>
              </Stack>
            </Stack>
          </Card>

          <Grid container spacing={4}>
            {/* Sidebar de información del cliente */}
            <Grid item xs={12} md={4}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: { xs: 3, md: 3.5 }, 
                  borderRadius: 5,
                  background: (theme) => theme.palette.mode === "dark"
                    ? "rgba(30, 41, 59, 0.5)"
                    : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(10px)",
                  border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                  height: "fit-content",
                  position: "sticky",
                  top: 32,
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      <AccountCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" color="text.secondary">
                        ID de cliente
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ wordBreak: "break-all" }}>
                        {customerId ?? "—"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderStyle: "dashed" }} />

                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Folios activos
                      </Typography>
                      <Chip 
                        label={subscriptionIds.length || "0"} 
                        color={subscriptionIds.length ? "primary" : "default"}
                        variant="filled"
                        size="small"
                      />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Estado
                      </Typography>
                      <Chip 
                        label={subscriptionIds.length ? "Activo" : "Sin actividad"} 
                        color={subscriptionIds.length ? "success" : "default"}
                        variant="outlined"
                        size="small"
                        icon={subscriptionIds.length ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                      />
                    </Stack>
                  </Stack>

                  <Divider sx={{ borderStyle: "dashed" }} />

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Información importante
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Los folios mostrados son comprobantes temporales. El CFDI oficial será generado por nuestro equipo y enviado a tu correo electrónico.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Lista de suscripciones */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3.5}>
                {subscriptions.length === 0 ? (
                  <Alert 
                    severity="info" 
                    icon={<ErrorOutlineIcon />} 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 3,
                      background: (theme) => theme.palette.mode === "dark"
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(59, 130, 246, 0.05)",
                    }}
                  >
                    No se encontraron folios. Regresa a <Link href="/precios" style={{ color: '#3b82f6', fontWeight: 600 }}>/precios</Link> para completar una suscripción.
                  </Alert>
                ) : (
                  subscriptions.map((sub) => (
                    <Card 
                      key={sub.id ?? sub.seat} 
                      sx={{ 
                        borderRadius: 5,
                        overflow: "hidden",
                        background: (theme) => theme.palette.mode === "dark"
                          ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)",
                        backdropFilter: "blur(10px)",
                        border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
                        boxShadow: (theme) => theme.palette.mode === "dark"
                          ? "0 4px 20px rgba(0, 0, 0, 0.2)"
                          : "0 4px 20px rgba(0, 0, 0, 0.03)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: (theme) => theme.palette.mode === "dark"
                            ? "0 8px 30px rgba(0, 0, 0, 0.3)"
                            : "0 8px 30px rgba(0, 0, 0, 0.08)",
                        }
                      }}
                    >
                      <CardContent sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4.5 } }}>
                        <Stack spacing={3}>
                          {/* Header de la tarjeta */}
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: sub.error ? "error.light" : "success.light" 
                              }}>
                                <PaymentIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  Folio #{sub.seat ?? "—"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {sub.plan_id || "Plan no especificado"}
                                </Typography>
                              </Box>
                            </Stack>
                            <Chip
                              label={sub.error ? `Error • ${sub.error}` : sub.status ?? "Desconocido"}
                              color={sub.error ? "error" : sub.status === "active" ? "success" : "default"}
                              variant={sub.error ? "outlined" : "filled"}
                              size="small"
                              icon={sub.error ? <ErrorOutlineIcon /> : <CheckCircleIcon />}
                            />
                          </Stack>

                          {/* IDs importantes */}
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            <Chip 
                              label={`ID: ${sub.id ?? "—"}`} 
                              variant="outlined" 
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip 
                              label={`Pedido: ${sub.last_billing_cycle_order_id ?? "—"}`} 
                              variant="outlined" 
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                            <Chip 
                              label={`Cargo: ${sub.charge_id ?? "—"}`} 
                              variant="outlined" 
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          {/* Información de fechas */}
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <CalendarMonthIcon fontSize="small" color="primary" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Inicio de ciclo
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatTimestamp(sub.billing_cycle_start)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <CalendarMonthIcon fontSize="small" color="primary" />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Fin de ciclo
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    {formatTimestamp(sub.billing_cycle_end)}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          </Grid>

                          <Typography variant="caption" color="text.secondary">
                            Creado: {formatTimestamp(sub.created_at)}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Footer informativo */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 4, 
              borderRadius: 4,
              background: (theme) => theme.palette.mode === "dark"
                ? "rgba(30, 41, 59, 0.5)"
                : "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: (theme) => `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}`,
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ¿Necesitas factura timbrada?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nuestro equipo utiliza estos folios para generar el CFDI oficial. Recibirás un correo electrónico con tu factura timbrada en un plazo máximo de 72 horas.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button 
                  component={Link} 
                  href="/" 
                  variant="contained"
                  startIcon={<CreditScoreIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Ir al inicio
                </Button>
                <Button 
                  component={Link} 
                  href="/precios" 
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Ver planes
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
