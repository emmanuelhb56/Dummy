import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, TrendingUp, Users, DollarSign, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CasosExitoPage() {
  const cases = [
    {
      company: "Grupo Industrial del Norte",
      industry: "Manufactura",
      location: "Monterrey, NL",
      employees: "450 empleados",
      image: "/images/cerrar-hombre-sujetando-el-portapapeles.jpg",
      challenge: "Gestión manual de 12 almacenes y falta de control en producción",
      solution: "Implementación completa de módulos de Inventarios, Manufactura y Contabilidad",
      results: [
        "85% reducción en tiempo de inventarios",
        "40% mejora en eficiencia de producción",
        "ROI del 320% en el primer año",
        "Eliminación de errores de stock",
      ],
      testimonial:
        "ERPExpert transformó completamente nuestra operación. Ahora tenemos control total de nuestros 12 almacenes y la producción es mucho más eficiente.",
      contact: "Ing. Carlos Mendoza, Director de Operaciones",
    },
    {
      company: "Comercializadora del Bajío",
      industry: "Distribución",
      location: "León, GTO",
      employees: "120 empleados",
      image: "/images/silos-agricolas-exterior-del-edificio.jpg",
      challenge: "Facturación manual y falta de control de vendedores",
      solution: "Módulos de Ventas & CRM, Contabilidad y Recursos Humanos",
      results: [
        "60% reducción en tiempo de facturación",
        "25% aumento en ventas por vendedor",
        "100% cumplimiento fiscal SAT",
        "Automatización completa de nómina",
      ],
      testimonial:
        "La facturación electrónica y el control de vendedores nos ahorran 20 horas semanales. El sistema se pagó solo en 8 meses.",
      contact: "Lic. María González, Gerente General",
    },
    {
      company: "Manufacturas del Sureste",
      industry: "Textil",
      location: "Mérida, YUC",
      employees: "280 empleados",
      image: "/images/escenas-de-personas-en-el-trabajo.jpg",
      challenge: "Control de calidad deficiente y costos de producción elevados",
      solution: "ERP completo con enfoque en Manufactura y Control de Calidad",
      results: [
        "50% reducción en productos defectuosos",
        "30% optimización de costos de producción",
        "ROI visible desde el primer mes",
        "Certificación ISO 9001 lograda",
      ],
      testimonial:
        "La implementación fue perfecta. El equipo de ERPExpert nos acompañó en cada paso y los resultados superaron nuestras expectativas.",
      contact: "Ing. Roberto Pérez, Director de Calidad",
    },
  ]

  const stats = [
    {
      icon: Users,
      value: "5,000+",
      label: "Empresas Atendidas",
      description: "En toda la República Mexicana",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Satisfacción del Cliente",
      description: "Basado en encuestas anuales",
    },
    {
      icon: DollarSign,
      value: "280%",
      label: "ROI Promedio",
      description: "En el primer año de implementación",
    },
    {
      icon: Clock,
      value: "15+",
      label: "Años de Experiencia",
      description: "Especializados en ERP mexicano",
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
              <h1 className="text-2xl font-bold text-foreground">Casos de Éxito</h1>
              <p className="text-sm text-muted-foreground">Empresas mexicanas que transformaron su operación</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Historias de Éxito Reales</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Descubre cómo empresas mexicanas de diferentes industrias han transformado sus operaciones y multiplicado su
            rentabilidad con ERPExpert.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-accent" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="space-y-12">
            {cases.map((case_, index) => (
              <Card key={index} className="hover-lift overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <Image
                      src={case_.image || "/placeholder.svg"}
                      alt={case_.company}
                      className="w-full h-full object-cover"
                      width={500}
                      height={500}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <Badge variant="secondary" className="mb-2">
                        {case_.industry}
                      </Badge>
                      <h3 className="text-xl font-bold">{case_.company}</h3>
                      <p className="text-sm opacity-90">
                        {case_.location} • {case_.employees}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8">
                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-2">El Desafío:</h4>
                      <p className="text-muted-foreground text-sm mb-4">{case_.challenge}</p>

                      <h4 className="font-semibold text-foreground mb-2">La Solución:</h4>
                      <p className="text-muted-foreground text-sm mb-4">{case_.solution}</p>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground mb-3">Resultados Obtenidos:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {case_.results.map((result, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-muted-foreground">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic text-sm mb-2">&quot;{case_.testimonial}&quot;</p>
                      <p className="text-xs text-muted-foreground font-medium">{case_.contact}</p>
                    </div>

                    <Button variant="outline" className="w-full bg-transparent">
                      Ver Caso Completo
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Industrias Atendidas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ERPExpert se adapta a las necesidades específicas de cada industria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Manufactura",
              "Distribución",
              "Retail",
              "Construcción",
              "Servicios",
              "Textil",
              "Alimentos",
              "Automotriz",
              "Farmacéutica",
              "Tecnología",
              "Logística",
              "Comercio",
            ].map((industry, index) => (
              <Card key={index} className="text-center p-4 hover-lift">
                <CardContent className="p-0">
                  <p className="font-medium text-foreground">{industry}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">¿Listo para ser nuestro próximo caso de éxito?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a las 5,000+ empresas mexicanas que ya transformaron su operación con ERPExpert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Solicitar Demo Personalizada</Button>
            <Button variant="outline" size="lg">
              Hablar con un Consultor
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
