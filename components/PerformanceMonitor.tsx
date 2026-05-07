"use client"

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  dns: number
  tcp: number
  request: number
  response: number
  dom: number
  load: number
  total: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 只在开发环境显示
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    const calculateMetrics = () => {
      if (typeof window === 'undefined' || !window.performance) {
        return null
      }

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (!navigation) return null

      const metrics: PerformanceMetrics = {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.requestStart - navigation.connectEnd,
        response: navigation.responseEnd - navigation.requestStart,
        dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        load: navigation.loadEventEnd - navigation.loadEventStart,
        total: navigation.loadEventEnd - navigation.fetchStart
      }

      return metrics
    }

    const handleLoad = () => {
      setTimeout(() => {
        const calculatedMetrics = calculateMetrics()
        if (calculatedMetrics) {
          setMetrics(calculatedMetrics)
          setIsVisible(true)
        }
      }, 1000)
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => window.removeEventListener('load', handleLoad)
  }, [])

  if (!isVisible || !metrics) return null

  const getPerformanceColor = (value: number) => {
    if (value < 100) return 'text-emerald-600 dark:text-emerald-400'
    if (value < 300) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 z-50 max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">性能监控</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground/70 hover:text-muted-foreground"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">DNS查询:</span>
          <span className={getPerformanceColor(metrics.dns)}>{metrics.dns.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">TCP连接:</span>
          <span className={getPerformanceColor(metrics.tcp)}>{metrics.tcp.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">请求响应:</span>
          <span className={getPerformanceColor(metrics.response)}>{metrics.response.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">DOM解析:</span>
          <span className={getPerformanceColor(metrics.dom)}>{metrics.dom.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">页面加载:</span>
          <span className={getPerformanceColor(metrics.load)}>{metrics.load.toFixed(0)}ms</span>
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <span className="text-foreground/85 font-medium">总时间:</span>
            <span className={`font-medium ${getPerformanceColor(metrics.total)}`}>
              {metrics.total.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
