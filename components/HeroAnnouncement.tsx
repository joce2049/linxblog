"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Megaphone, ShieldAlert, Sparkles, Info, Bell, Lightbulb } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/config/site"
import type { AnnouncementItem } from "@/config/site"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Megaphone,
  ShieldAlert,
  Sparkles,
  Info,
  Bell,
  Lightbulb,
}

const typeStyles: Record<AnnouncementItem["type"], { badge: string; text: string; dot: string }> = {
  info:    { badge: "bg-blue-100 text-blue-700",    text: "text-blue-600",  dot: "bg-blue-500" },
  success: { badge: "bg-green-100 text-green-700",  text: "text-green-600", dot: "bg-green-500" },
  warning: { badge: "bg-amber-100 text-amber-700",  text: "text-amber-600", dot: "bg-amber-500" },
  tip:     { badge: "bg-purple-100 text-purple-700",text: "text-purple-600",dot: "bg-purple-500" },
}

export default function HeroAnnouncement() {
  const announcements = siteConfig.pages.home.announcements
  const config = siteConfig.pages.home.heroCarousel
  const total = announcements.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [transitionKey, setTransitionKey] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
    setTransitionKey((prev) => prev + 1)
  }, [])

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total)
    setTransitionKey((prev) => prev + 1)
  }, [total])

  useEffect(() => {
    if (isPaused || total <= 1) return
    intervalRef.current = setInterval(goNext, config.intervalMs)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, goNext, config.intervalMs, total])

  if (total === 0) return null

  const current = announcements[activeIndex]
  const IconComponent = iconMap[current.icon] || Bell
  const styles = typeStyles[current.type as AnnouncementItem["type"]] || typeStyles.info

  return (
    <div
      className="relative w-full max-w-2xl mx-auto"
      onMouseEnter={() => config.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => config.pauseOnHover && setIsPaused(false)}
    >
      <div
        key={transitionKey}
        className="animate-fade-in-up"
        style={{ minHeight: config.minHeight ? `${config.minHeight}px` : undefined }}
      >
        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-3", styles.badge)}>
          <IconComponent className="w-4 h-4" />
          <span>{current.title}</span>
        </div>
        <p className={cn("text-base md:text-lg mb-4", styles.text)}>
          {current.message}
        </p>
        {current.link && (
          <Link
            href={current.link}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
          >
            查看详情
            <span className="text-xs">&rarr;</span>
          </Link>
        )}
      </div>

      {config.showDots && total > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-blue-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`第 ${i + 1} 条公告`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
