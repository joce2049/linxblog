'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface UnifiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    className?: string
    fallbackSrc?: string
}

// 加载失败占位图（例如图片在 Notion 被删除）。图片过期已由 /api/media 稳定代理根治，
// src 永不含过期 URL，这里的失败分支只应对「真·加载失败」，故文案是「加载失败」。
const DEFAULT_FALLBACK =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect width="800" height="450" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E图片加载失败%3C/text%3E%3C/svg%3E'

export default function UnifiedImage({
    src,
    alt,
    className,
    fallbackSrc = DEFAULT_FALLBACK,
    ...props
}: UnifiedImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)

    // src 变化时重置状态
    useEffect(() => {
        setImgSrc(src)
        setHasError(false)
        setIsLoading(true)
    }, [src])

    // 加载状态收尾。关键：不依赖 React 合成的 onLoad/onError ——
    // 命中浏览器缓存的图会在挂监听前就同步 load、hydration 后合成事件也常不触发，
    // 导致 isLoading 卡在 true → 图片虽已加载却因 opacity-0 隐形（软导航/返回时尤其明显）。
    // 这里改为：先查 img.complete 兜住缓存命中，未完成则用命令式监听（挂在真实元素上，必触发）。
    useEffect(() => {
        const img = imgRef.current
        if (!img) return

        const markLoaded = () => setIsLoading(false)
        const markError = () => {
            setHasError(true)
            setImgSrc(fallbackSrc)
            setIsLoading(false)
        }

        if (img.complete) {
            if (img.naturalWidth > 0) markLoaded()
            else if (!hasError) markError()
            return
        }

        img.addEventListener('load', markLoaded)
        img.addEventListener('error', markError)
        return () => {
            img.removeEventListener('load', markLoaded)
            img.removeEventListener('error', markError)
        }
    }, [imgSrc, hasError, fallbackSrc])

    return (
        <img
            ref={imgRef}
            loading="lazy"
            decoding="async"
            src={imgSrc}
            alt={alt}
            className={cn(
                className,
                isLoading && !hasError ? "opacity-0" : "opacity-100",
                "transition-opacity duration-300"
            )}
            referrerPolicy="no-referrer"
            {...props}
        />
    )
}
