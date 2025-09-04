"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Gift, Clock } from "lucide-react"

interface ExitPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function ExitPopup({ isOpen, onClose }: ExitPopupProps) {
  const [email, setEmail] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log("Email submitted:", email)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">¡Espera!</CardTitle>
            <CardDescription className="mt-2">No te vayas sin tu descuento especial</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
              <Clock className="w-4 h-4 mr-2" />
              20% OFF
            </Badge>
            <p className="text-sm text-muted-foreground mb-6">
              Obtén un 20% de descuento en tu primera compra. Solo por tiempo limitado.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Tu email aquí..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
              required
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Obtener Descuento
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                No, gracias
              </Button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            * Válido solo para nuevos clientes. Términos y condiciones aplican.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
