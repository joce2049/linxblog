"use client"

import { useState, useEffect } from 'react'

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number | null = null

    const updateProgress = () => {
      rafId = null
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const scrollPercent = window.scrollY / docHeight
      setProgress(Math.min(scrollPercent * 100, 100))
    }

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateProgress)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50" style={{ background: 'hsl(var(--muted) / 0.4)' }}>
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: 'var(--gradient-progress)',
          boxShadow: '0 0 8px rgba(46, 82, 122, 0.35)'
        }}
      />
    </div>
  )
}
