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
    fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect width="800" height="450" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E图片加载中...%3C/text%3E%3C/svg%3E',
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
        <img
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
