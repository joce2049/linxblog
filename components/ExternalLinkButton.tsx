"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ExternalLinkButtonProps {
  url: string
}

export default function ExternalLinkButton({ url }: ExternalLinkButtonProps) {
  const handleExternalLink = () => {
    window.open(url, '_blank')
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="flex-1 border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"
      onClick={handleExternalLink}
    >
      <ExternalLink className="w-5 h-5 mr-2" />
      在新窗口打开
    </Button>
  )
}
