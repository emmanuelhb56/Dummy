"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Clock, CheckCircle } from "lucide-react"

interface PromotionPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function PromotionPopup({ isOpen, onClose }: PromotionPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos en segundos

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const benefits = [
    "Demo personalizada gratuita",
    "Consultoría de implementación incluida",
    "3 meses de soporte premium sin costo",
    "Capacitación para todo tu equipo",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-fade-in-scale">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-accent" />
              <DialogTitle className="text-xl font-bold">¡Oferta Especial!</DialogTitle>
            </div>
          </div>
          <DialogDescription className="sr-only">
            Oferta especial de 30% de descuento en tu primera implementación de ERPExpert con beneficios adicionales
            incluidos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <Badge className="mb-2 animate-pulse-subtle bg-accent text-accent-foreground py-2 px-2">
              ⏰ Oferta por tiempo limitado
            </Badge>
            <h3 className="text-2xl font-bold text-foreground mb-2">30% de Descuento</h3>
            <p className="text-muted-foreground">En tu primera implementación de ERPExpert</p>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 shadow-md text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-accent" />
              <span className="font-semibold">Tiempo restante:</span>
            </div>
            <div className="text-3xl font-bold text-accent">{formatTime(timeLeft)}</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Incluye:</h4>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button className="w-full" size="lg">
              Solicitar Oferta Ahora
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
              Tal vez después
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Oferta válida para nuevos clientes. Aplican términos y condiciones.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
