"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Monitor, ArrowLeft, Wrench, Shield, Truck, Users, Clock, CheckCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function ServiciosPage() {
  const services = [
    {
      icon: Wrench,
      title: "Reparación Técnica",
      description: "Servicio especializado para todos tus dispositivos",
      features: ["Diagnóstico gratuito", "Repuestos originales", "Garantía de 6 meses"],
      price: "Desde $50",
      popular: false,
    },
    {
      icon: Shield,
      title: "Garantía Extendida",
      description: "Protección completa para tu inversión tecnológica",
      features: ["Cobertura total", "Reemplazo inmediato", "Soporte 24/7"],
      price: "Desde $99/año",
      popular: true,
    },
    {
      icon: Truck,
      title: "Instalación a Domicilio",
      description: "Configuramos tus equipos en la comodidad de tu hogar",
      features: ["Técnicos certificados", "Configuración completa", "Capacitación incluida"],
      price: "Desde $75",
      popular: false,
    },
    {
      icon: Users,
      title: "Soporte Empresarial",
      description: "Soluciones tecnológicas para tu empresa",
      features: ["Consultoría IT", "Mantenimiento preventivo", "Soporte remoto"],
      price: "Cotización personalizada",
      popular: false,
    },
  ]

  const benefits = [
    {
      icon: Clock,
      title: "Respuesta Rápida",
      description: "Atención en menos de 24 horas",
    },
    {
      icon: CheckCircle,
      title: "Calidad Garantizada",
      description: "Técnicos certificados y experimentados",
    },
    {
      icon: Shield,
      title: "Protección Total",
      description: "Garantía en todos nuestros servicios",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Servicios</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Servicios Profesionales</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ofrecemos soporte técnico completo para mantener tus dispositivos funcionando perfectamente
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card key={index} className={`relative ${service.popular ? "ring-2 ring-accent" : ""}`}>
                {service.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent">Más Popular</Badge>
                )}

                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-2xl font-bold text-accent">{service.price}</span>
                    <Button variant={service.popular ? "default" : "outline"}>Solicitar Servicio</Button>
                  </div>
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
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Por qué elegir nuestros servicios?</h2>
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

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda con tu dispositivo?</h2>
          <p className="text-xl mb-8 opacity-90">Contáctanos y te ayudaremos a encontrar la mejor solución</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Llamar Ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2 text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              <Mail className="w-5 h-5" />
              Enviar Email
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
