"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  BarChart3,
  Users,
  Package,
  Calculator,
  FileText,
  Menu,
  X,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Award,
  CheckCircle,
  TrendingUp,
  Globe,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { PromotionPopup } from "@/components/promotion-popup"
import { PricingBanner } from "@/components/pricing-banner"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPromotionPopup, setShowPromotionPopup] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPromotionPopup(true)
    }, 45000) // 45 segundos para ser menos invasivo

    return () => clearTimeout(timer)
  }, [])

  const erpModules = [
    {
      icon: BarChart3,
      title: "Contabilidad",
      description: "Control financiero completo y reportes en tiempo real",
      features: ["Estados financieros", "Facturación electrónica", "Reportes fiscales"],
      color: "text-blue-600",
    },
    {
      icon: Package,
      title: "Inventarios",
      description: "Gestión inteligente de almacenes y productos",
      features: ["Control de stock", "Códigos de barras", "Alertas automáticas"],
      color: "text-green-600",
    },
    {
      icon: Users,
      title: "Recursos Humanos",
      description: "Administración integral de personal",
      features: ["Nómina", "Control de asistencia", "Evaluaciones"],
      color: "text-purple-600",
    },
    {
      icon: FileText,
      title: "Ventas & CRM",
      description: "Gestión de clientes y proceso de ventas",
      features: ["Cotizaciones", "Seguimiento", "Análisis de ventas"],
      color: "text-orange-600",
    },
    {
      icon: Calculator,
      title: "Compras",
      description: "Optimización de procesos de adquisición",
      features: ["Órdenes de compra", "Proveedores", "Control de gastos"],
      color: "text-red-600",
    },
    {
      icon: Building2,
      title: "Manufactura",
      description: "Control de producción y calidad",
      features: ["Órdenes de trabajo", "BOM", "Control de calidad"],
      color: "text-indigo-600",
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: "15+ Años de Experiencia",
      description: "Líderes en el mercado mexicano con miles de empresas satisfechas",
    },
    {
      icon: Clock,
      title: "Implementación Rápida",
      description: "Puesta en marcha en 30 días con capacitación incluida",
    },
    {
      icon: Award,
      title: "Soporte Especializado",
      description: "Equipo técnico mexicano disponible 6 días a la semana",
    },
  ]

  const testimonials = [
    {
      company: "Grupo Industrial del Norte",
      location: "Monterrey, NL",
      text: "ERPExpert transformó nuestra operación. Ahora tenemos control total de nuestros 12 almacenes.",
      rating: 5,
    },
    {
      company: "Comercializadora del Bajío",
      location: "León, GTO",
      text: "La facturación electrónica y reportes fiscales nos ahorran 20 horas semanales.",
      rating: 5,
    },
    {
      company: "Manufacturas del Sureste",
      location: "Mérida, YUC",
      text: "Implementación perfecta. El ROI se vio desde el primer mes de operación.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">ERPExpert</h1>
                <p className="text-xs text-muted-foreground">Soluciones Empresariales</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
                Inicio
              </Link>
              <Link href="/modulos" className="text-muted-foreground hover:text-primary transition-colors">
                Módulos
              </Link>
              <Link href="/precios" className="text-muted-foreground hover:text-primary transition-colors">
                Precios
              </Link>
              <Link href="/casos-exito" className="text-muted-foreground hover:text-primary transition-colors">
                Casos de Éxito
              </Link>
              <Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors">
                Contacto
              </Link>
              <Button size="sm" className="ml-2">
                Demo Gratuita
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-slide-in-top">
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-foreground hover:text-primary transition-colors py-2 font-medium">
                  Inicio
                </Link>
                <Link href="/modulos" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Módulos
                </Link>
                <Link href="/precios" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Precios
                </Link>
                <Link href="/casos-exito" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Casos de Éxito
                </Link>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary transition-colors py-2">
                  Contacto
                </Link>
                <Button size="sm" className="mt-2 w-fit">
                  Demo Gratuita
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Pricing Banner */}
      <PricingBanner />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge
            className="mb-6 animate-fade-in-scale px-4 py-2 bg-accent text-accent-foreground font-bold rounded-full"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Líder en ERP México 2024
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            El ERP que
            <span className="text-accent"> Transforma</span> tu Empresa
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
            Más de 15 años ayudando a pequeñas, medianas y grandes empresas mexicanas a optimizar sus procesos con
            soluciones ERP confiables, seguras y fáciles de usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="group">
              Solicitar Demo Gratuita
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Ver Casos de Éxito
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>5,000+ empresas confían en nosotros</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Presencia en toda la República Mexicana</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>98% de satisfacción del cliente</span>
            </div>
          </div>
        </div>
      </section>

      {/* ERP Modules Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Módulos Empresariales Completos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Solución integral que se adapta a las necesidades específicas de tu empresa mexicana
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {erpModules.map((module, index) => (
              <Card key={index} className="group hover-lift hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${module.color}`}
                  >
                    <module.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Conocer Más
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué elegir ERPExpert?</h2>
            <p className="text-muted-foreground">Compromiso, experiencia y resultados comprobados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-muted-foreground">Empresas mexicanas que ya transformaron su operación</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">{`&quot;${testimonial.text}&quot;`}</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.company}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para transformar tu empresa?</h2>
          <p className="text-xl mb-8 opacity-90">Únete a las 5,000+ empresas que ya confían en ERPExpert</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="ml-2 text-lg">4.9/5 (1,247 empresas)</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="group">
              Solicitar Demo Gratuita
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Hablar con un Experto
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground text-lg">ERPExpert</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Líderes en soluciones ERP para empresas mexicanas desde 2009.
              </p>
              <p className="text-xs text-muted-foreground">
                RFC: ERP123456789
                <br />
                Certificado SAT para facturación electrónica
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Módulos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/modulos/contabilidad" className="hover:text-primary transition-colors">
                    Contabilidad
                  </Link>
                </li>
                <li>
                  <Link href="/modulos/inventarios" className="hover:text-primary transition-colors">
                    Inventarios
                  </Link>
                </li>
                <li>
                  <Link href="/modulos/recursos-humanos" className="hover:text-primary transition-colors">
                    Recursos Humanos
                  </Link>
                </li>
                <li>
                  <Link href="/modulos/ventas-crm" className="hover:text-primary transition-colors">
                    Ventas & CRM
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/soporte" className="hover:text-primary transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/capacitacion" className="hover:text-primary transition-colors">
                    Capacitación
                  </Link>
                </li>
                <li>
                  <Link href="/actualizaciones" className="hover:text-primary transition-colors">
                    Actualizaciones
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-primary transition-colors">
                    Contacto Técnico
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/nosotros" className="hover:text-primary transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/casos-exito" className="hover:text-primary transition-colors">
                    Casos de Éxito
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="hover:text-primary transition-colors">
                    Partners
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-primary transition-colors">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ERPExpert México. Todos los derechos reservados. | Hecho en México 🇲🇽</p>
          </div>
        </div>
      </footer>

      {/* Promotion Popup */}
      <PromotionPopup isOpen={showPromotionPopup} onClose={() => setShowPromotionPopup(false)} />
    </div>
  )
}
