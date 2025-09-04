"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Zap, ArrowRight } from "lucide-react"

export function PricingBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-accent text-accent-foreground py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Zap className="w-5 h-5 animate-pulse-subtle" />
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-accent-foreground/20 text-accent-foreground">
              Promoción Especial
            </Badge>
            <span className="text-sm font-medium">
              Implementación ERP desde $15,000 MXN/mes - Sin costos de instalación
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-accent-foreground text-accent hover:bg-accent-foreground/90 hidden sm:flex"
          >
            Ver Precios
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-accent-foreground hover:bg-accent-foreground/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
