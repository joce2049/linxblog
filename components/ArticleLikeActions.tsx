'use client'

import { Button } from '@/components/ui/button'
import { Heart, MessageCircle } from 'lucide-react'
import { useArticleStats } from '@/hooks/useArticleStats'
import { cn } from '@/lib/utils'

interface ArticleLikeActionsProps {
    articleId: string
    initialComments: number
}

export default function ArticleLikeActions({ articleId, initialComments }: ArticleLikeActionsProps) {
    const { views, likes, isLiked, isLoading, toggleLike } = useArticleStats(articleId)

    return (
        <div className="flex gap-4">
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "gap-2 transition-colors",
                    isLiked && "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                )}
                onClick={toggleLike}
                disabled={isLoading}
            >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                点赞 ({likes})
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                评论 ({initialComments})
            </Button>
        </div>
    )
}
