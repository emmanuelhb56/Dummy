"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Award,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    employees: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Teléfono",
      details: ["+52 (55) 1234-5678", "+52 (81) 9876-5432"],
      description: "Lun - Sáb: 8:00 AM - 7:00 PM",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["ventas@erpexpert.mx", "soporte@erpexpert.mx"],
      description: "Respuesta en 2 horas",
    },
    {
      icon: MapPin,
      title: "Oficinas",
      details: ["CDMX: Av. Reforma 123, Col. Centro", "MTY: Av. Constitución 456, San Pedro"],
      description: "Presencia en toda la República",
    },
    {
      icon: Clock,
      title: "Horarios de Atención",
      details: ["Lun - Vie: 8:00 AM - 7:00 PM", "Sáb: 9:00 AM - 2:00 PM"],
      description: "Soporte técnico 24/7",
    },
  ]

  const whyChooseUs = [
    {
      icon: Users,
      title: "15+ Años de Experiencia",
      description: "Líderes en ERP para empresas mexicanas",
    },
    {
      icon: Award,
      title: "5,000+ Empresas Satisfechas",
      description: "Desde PyMEs hasta corporativos",
    },
    {
      icon: Shield,
      title: "Soporte Especializado",
      description: "Equipo técnico mexicano certificado",
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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">ERPExpert</h1>
                <p className="text-xs text-muted-foreground">Contacto</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Hablemos de tu ERP</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Nuestros consultores especializados están listos para ayudarte a transformar tu empresa. Solicita una demo
            personalizada sin compromiso.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ====== Formulario de Contacto ====== */}
          <Card className="hover-lift shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Solicita tu Demo Gratuita
              </CardTitle>
              <CardDescription>
                Completa el formulario y un consultor se pondrá en contacto contigo en menos de 2 horas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nombre Completo *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Corporativo *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@empresa.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                      Teléfono *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+52 (55) 1234-5678"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                      Empresa *
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Nombre de tu empresa"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="employees" className="block text-sm font-medium text-foreground mb-2">
                      Número de Empleados
                    </label>
                    <select
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecciona el tamaño</option>
                      <option value="1-25">1-25 empleados</option>
                      <option value="26-100">26-100 empleados</option>
                      <option value="101-500">101-500 empleados</option>
                      <option value="500+">Más de 500 empleados</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Interés Principal *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="demo">Demo del sistema</option>
                      <option value="pricing">Información de precios</option>
                      <option value="implementation">Proceso de implementación</option>
                      <option value="migration">Migración desde otro ERP</option>
                      <option value="support">Soporte técnico</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Cuéntanos sobre tu empresa
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe tu industria, procesos actuales y qué esperas de un ERP..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Solicitar Demo Gratuita
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Al enviar este formulario, aceptas que un consultor de ERPExpert se ponga en contacto contigo.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* ====== Información de Contacto ====== */}
          <div className="space-y-6">
            {/* Por qué elegirnos */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">¿Por qué elegir ERPExpert?</h2>
              <div className="grid gap-4 mb-8">
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos de contacto */}
            <h3 className="text-xl font-bold text-foreground mb-4">Información de Contacto</h3>
            <p className="text-muted-foreground mb-6">
              Múltiples canales de comunicación para brindarte el mejor servicio.
            </p>
            <div className="grid gap-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-sm text-foreground">{detail}</p>
                      ))}
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mapa */}
            <Card className="hover-lift">
              <CardContent className="p-0">
                <div className="w-full h-48 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-accent mx-auto mb-2" />
                    <p className="text-foreground font-medium">Oficinas en CDMX y Monterrey</p>
                    <p className="text-sm text-muted-foreground">Cobertura nacional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">¿Prefieres que te llamemos?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Déjanos tu número y un consultor especializado te contactará en los próximos 30 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Phone className="w-4 h-4 mr-2" />
              Solicitar Llamada
            </Button>
            <Button variant="outline" size="lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat en Vivo
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
