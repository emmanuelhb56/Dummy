import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Package, Users, FileText, Calculator, Building2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ModulosPage() {
  const modules = [
    {
      icon: BarChart3,
      title: "Contabilidad y Finanzas",
      description: "Control financiero completo con reportes en tiempo real",
      features: [
        "Estados financieros automáticos",
        "Facturación electrónica SAT",
        "Reportes fiscales mexicanos",
        "Control de flujo de efectivo",
        "Conciliación bancaria",
        "Análisis de rentabilidad",
      ],
      price: "Desde $3,500 MXN/mes",
      popular: true,
    },
    {
      icon: Package,
      title: "Gestión de Inventarios",
      description: "Control inteligente de almacenes y productos",
      features: [
        "Control de stock en tiempo real",
        "Códigos de barras y QR",
        "Alertas de reorden automático",
        "Múltiples almacenes",
        "Trazabilidad completa",
        "Reportes de rotación",
      ],
      price: "Desde $2,800 MXN/mes",
    },
    {
      icon: Users,
      title: "Recursos Humanos",
      description: "Administración integral de personal",
      features: [
        "Nómina mexicana (IMSS, INFONAVIT)",
        "Control de asistencia biométrico",
        "Evaluaciones de desempeño",
        "Expedientes digitales",
        "Reportes laborales",
        "Portal del empleado",
      ],
      price: "Desde $4,200 MXN/mes",
    },
    {
      icon: FileText,
      title: "Ventas y CRM",
      description: "Gestión completa del proceso de ventas",
      features: [
        "Pipeline de ventas visual",
        "Cotizaciones automáticas",
        "Seguimiento de clientes",
        "Análisis de vendedores",
        "Comisiones automáticas",
        "Integración con e-commerce",
      ],
      price: "Desde $3,200 MXN/mes",
    },
    {
      icon: Calculator,
      title: "Compras y Proveedores",
      description: "Optimización del proceso de adquisiciones",
      features: [
        "Órdenes de compra digitales",
        "Evaluación de proveedores",
        "Control de gastos",
        "Solicitudes de compra",
        "Comparativo de cotizaciones",
        "Reportes de compras",
      ],
      price: "Desde $2,500 MXN/mes",
    },
    {
      icon: Building2,
      title: "Manufactura",
      description: "Control de producción y calidad",
      features: [
        "Órdenes de trabajo",
        "Lista de materiales (BOM)",
        "Control de calidad",
        "Planeación de producción",
        "Costos de manufactura",
        "Trazabilidad de lotes",
      ],
      price: "Desde $5,800 MXN/mes",
    },
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
              <h1 className="text-2xl font-bold text-foreground">Módulos ERP</h1>
              <p className="text-sm text-muted-foreground">Soluciones especializadas para cada área de tu empresa</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Módulos Empresariales Completos</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Cada módulo está diseñado específicamente para las necesidades de las empresas mexicanas, cumpliendo con
            todas las regulaciones fiscales y laborales del país.
          </p>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <Card key={index} className={`hover-lift relative ${module.popular ? "ring-2 ring-accent" : ""}`}>
                {module.popular && (
                  <Badge className="absolute -top-2 left-4 bg-accent text-accent-foreground">Más Popular</Badge>
                )}
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <module.icon className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                  <div className="text-2xl font-bold text-accent mt-2">{module.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={module.popular ? "default" : "outline"}>
                    Solicitar Demo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">¿Necesitas una solución personalizada?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nuestros expertos pueden combinar módulos y crear una solución ERP perfecta para tu empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Hablar con un Consultor</Button>
            <Button variant="outline" size="lg">
              Ver Casos de Éxito
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
