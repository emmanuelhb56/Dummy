import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Star, Users, Building, Factory } from "lucide-react"
import Link from "next/link"

export default function PreciosPage() {
  const plans = [
    {
      name: "Pequeña Empresa",
      icon: Users,
      description: "Perfecto para empresas de 1-25 empleados",
      price: "15,000",
      period: "mes",
      setup: "Gratis",
      features: [
        "Contabilidad básica",
        "Facturación electrónica",
        "Control de inventarios",
        "Hasta 3 usuarios",
        "Soporte por email",
        "Reportes básicos",
        "Respaldo en la nube",
      ],
      popular: false,
    },
    {
      name: "Mediana Empresa",
      icon: Building,
      description: "Ideal para empresas de 25-100 empleados",
      price: "28,000",
      period: "mes",
      setup: "Gratis",
      features: [
        "Todos los módulos incluidos",
        "Recursos Humanos completo",
        "CRM avanzado",
        "Hasta 15 usuarios",
        "Soporte telefónico",
        "Reportes avanzados",
        "Integraciones API",
        "Capacitación incluida",
      ],
      popular: true,
    },
    {
      name: "Gran Empresa",
      icon: Factory,
      description: "Para empresas de 100+ empleados",
      price: "45,000",
      period: "mes",
      setup: "Gratis",
      features: [
        "Solución completa ERP",
        "Manufactura avanzada",
        "BI y Analytics",
        "Usuarios ilimitados",
        "Soporte 24/7",
        "Consultor dedicado",
        "Personalización incluida",
        "Implementación premium",
      ],
      popular: false,
    },
  ]

  const addOns = [
    { name: "Usuario adicional", price: "450 MXN/mes" },
    { name: "Módulo de Manufactura", price: "8,500 MXN/mes" },
    { name: "BI y Reportes Avanzados", price: "3,200 MXN/mes" },
    { name: "Integración personalizada", price: "Desde 15,000 MXN" },
    { name: "Capacitación adicional", price: "2,500 MXN/día" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Precios</h1>
              <p className="text-sm text-muted-foreground">Planes transparentes sin sorpresas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Precios Transparentes para Cada Empresa</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sin costos ocultos, sin sorpresas. Elige el plan que mejor se adapte al tamaño y necesidades de tu empresa.
          </p>
          <Badge variant="secondary" className="mb-8">
            🎯 Promoción: Sin costo de implementación hasta marzo 2024
          </Badge>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`hover-lift relative ${plan.popular ? "ring-2 ring-accent scale-105" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <plan.icon className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-foreground">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">Implementación: {plan.setup}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"} size="lg">
                    Solicitar Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Servicios Adicionales</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Personaliza tu solución ERP con servicios adicionales según tus necesidades específicas
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complementos Disponibles</CardTitle>
                <CardDescription>Expande las capacidades de tu ERP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addOns.map((addon, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-foreground">{addon.name}</span>
                      <span className="text-accent font-semibold">{addon.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Hay costos de implementación?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Actualmente ofrecemos implementación gratuita hasta marzo 2024. Normalmente tiene un costo de $25,000
                  a $50,000 MXN dependiendo de la complejidad.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo cambiar de plan después?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se reflejan en tu siguiente
                  facturación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Incluye capacitación?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Los planes Mediana y Gran Empresa incluyen capacitación. Para Pequeña Empresa, la capacitación tiene
                  un costo adicional de $2,500 MXN por día.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl mb-8 opacity-90">Solicita una demo personalizada sin compromiso</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="ml-2 text-lg">4.9/5 - Más de 1,200 empresas satisfechas</span>
          </div>
          <Button size="lg" variant="secondary">
            Solicitar Demo Gratuita
          </Button>
        </div>
      </section>
    </div>
  )
}
