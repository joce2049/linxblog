"use client"

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className={cn(
        "border-4 border-border border-t-primary rounded-full animate-spin",
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

// 页面级加载组件
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="xl" text="页面加载中..." />
        <p className="mt-4 text-muted-foreground">请稍候...</p>
      </div>
    </div>
  )
}

// 内容加载组件
export function ContentLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text="内容加载中..." />
    </div>
  )
}

// 按钮加载状态
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span>加载中...</span>
    </div>
  )
}
