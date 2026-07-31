'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UnifiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    className?: string
    fallbackSrc?: string
    /** Notion 页面 ID：图片 URL 过期（S3 403）时，用它向 /api/notion-image-url 换一个新鲜 URL 再重试一次 */
    pageId?: string
}

export default function UnifiedImage({
    src,
    alt,
    className,
    fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect width="800" height="450" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E图片加载中...%3C/text%3E%3C/svg%3E',
    pageId,
    ...props
}: UnifiedImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [triedRefresh, setTriedRefresh] = useState(false)

    useEffect(() => {
        setImgSrc(src)
        setHasError(false)
        setTriedRefresh(false)
        setIsLoading(true)
    }, [src])

    const handleError = async () => {
        // 首次失败且有 pageId：多半是 Notion S3 预签名 URL 过期，向服务端换一个新鲜 URL 再重试一次
        if (pageId && !triedRefresh) {
            setTriedRefresh(true)
            try {
                const res = await fetch(`/api/notion-image-url?id=${encodeURIComponent(pageId)}`, {
                    cache: 'no-store',
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data?.url) {
                        setImgSrc(data.url) // 用新 URL 重试；若再失败会走到下面的占位图分支
                        return
                    }
                }
            } catch {
                // 忽略，落到占位图
            }
        }

        // 无 pageId / 已重试过 / 刷新失败：显示占位图
        if (!hasError) {
            setHasError(true)
            setImgSrc(fallbackSrc)
            setIsLoading(false)
        }
    }

    const handleLoad = () => {
        setIsLoading(false)
    }

    return (
        <img
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
            onError={handleError}
            onLoad={handleLoad}
            {...props}
        />
    )
}
