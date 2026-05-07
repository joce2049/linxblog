"use client"

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface PageLoadingProps {
  message?: string
  showProgress?: boolean
}

export default function PageLoading({ 
  message = "正在加载精彩内容...", 
  showProgress = true 
}: PageLoadingProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showProgress) return

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo 占位 */}
        <div className="mb-8">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
        
        {/* 加载消息 */}
        <div className="mb-6">
          <Skeleton className="h-6 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
        
        {/* 进度条 */}
        {showProgress && (
          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </div>
          </div>
        )}
        
        {/* 加载动画 */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}
