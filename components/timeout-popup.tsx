"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Zap, Timer } from "lucide-react"

interface TimeoutPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function TimeoutPopup({ isOpen, onClose }: TimeoutPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        const newTime = prev - 1
        setProgress((newTime / 300) * 100)
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-md animate-slide-in">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Timer className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">¡Oferta por Tiempo Limitado!</CardTitle>
            <CardDescription className="mt-2">
              Has estado navegando por un tiempo. ¡No pierdas esta oportunidad!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <Progress value={progress} className="w-full mb-4" />
            <p className="text-sm text-muted-foreground">Tiempo restante para aprovechar el descuento</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-lg mb-1">Flash Sale</h3>
            <p className="text-2xl font-bold text-accent mb-2">30% OFF</p>
            <p className="text-sm text-muted-foreground">En productos seleccionados</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">Ver Ofertas Flash</Button>
            <Button variant="outline" onClick={onClose}>
              Más tarde
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Oferta válida solo durante el tiempo mostrado. Stock limitado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
