'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className="border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      返回
    </Button>
  )
}
