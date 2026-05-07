"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadButtonProps {
  url: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline"
  className?: string
}

export default function DownloadButton({ 
  url, 
  size = "sm", 
  variant = "outline",
  className = ""
}: DownloadButtonProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, '_blank')
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={`text-xs px-2 py-1 border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground ${className}`}
      onClick={handleDownload}
    >
      <Download className="w-3 h-3 mr-1" />
      下载
    </Button>
  )
}
