"use client"

import { siteConfig } from "@/lib/config"
import { useState, useEffect } from "react"
import CONFIG from "../config"

/**
 * 通知栏组件
 */
export const NoticeBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const notices = siteConfig("HEO_MODERN_NOTICE_BAR", [], CONFIG)

  useEffect(() => {
    if (notices.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % notices.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [notices.length])

  if (!notices || notices.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <a href={notices[currentIndex]?.url || "/"} className="text-sm hover:underline transition-all duration-200">
              {notices[currentIndex]?.title}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
