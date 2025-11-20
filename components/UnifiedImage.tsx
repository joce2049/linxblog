'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface UnifiedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string
    alt: string
    className?: string
    fallbackSrc?: string
}

export default function UnifiedImage({
    src,
    alt,
    className,
    fallbackSrc = '/placeholder-image.svg',
    ...props
}: UnifiedImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        setImgSrc(src)
        setHasError(false)
        setIsLoading(true)
    }, [src])

    const handleError = () => {
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
        <div className={cn("relative overflow-hidden bg-gray-100", className)}>
            {/* 加载动画 */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* 图片 */}
            <img
                src={imgSrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                referrerPolicy="no-referrer"
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />

            {/* 错误提示 (可选，仅当 fallback 也失败或需要显式提示时) */}
            {hasError && imgSrc === fallbackSrc && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-xs">无法加载</span>
                </div>
            )}
        </div>
    )
}
