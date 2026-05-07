"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true })
    toggleVisibility()
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm border border-border hover:bg-card transition-all duration-300 z-40"
      size="icon"
    >
      <ChevronUp className="w-5 h-5 text-foreground/80" />
    </Button>
  )
}
