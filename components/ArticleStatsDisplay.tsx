'use client'

import { Eye, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
    ARTICLE_STATS_UPDATED_EVENT,
    type ArticleStatsUpdateDetail
} from '@/lib/article-stats-events'

interface StatsDisplayProps {
    articleId: string
    initialViews: number
    initialLikes: number
    comments: number
}

export default function ArticleStatsDisplay({
    articleId,
    initialViews,
    initialLikes,
    comments
}: StatsDisplayProps) {
    const [stats, setStats] = useState({ views: initialViews, likes: initialLikes })
    const [isLoading, setIsLoading] = useState(true)
    const lastLiveUpdateRef = useRef(0)

    useEffect(() => {
        // 获取最新统计数据
        const fetchStats = async () => {
            const requestStartedAt = Date.now()

            try {
                const response = await fetch(`/api/analytics/stats?articleIds=${articleId}`, {
                    cache: 'no-store'
                })
                if (!response.ok) {
                    throw new Error(`Failed to fetch stats: ${response.status}`)
                }

                const data = await response.json()
                const stat = data.stats[articleId]
                if (stat && lastLiveUpdateRef.current <= requestStartedAt) {
                    setStats({ views: stat.views, likes: stat.likes })
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        const handleStatsUpdate = (event: Event) => {
            const { detail } = event as CustomEvent<ArticleStatsUpdateDetail>
            if (detail.articleId !== articleId) return

            lastLiveUpdateRef.current = Date.now()
            setStats({ views: detail.views, likes: detail.likes })
            setIsLoading(false)
        }

        window.addEventListener(ARTICLE_STATS_UPDATED_EVENT, handleStatsUpdate)
        fetchStats()

        return () => {
            window.removeEventListener(ARTICLE_STATS_UPDATED_EVENT, handleStatsUpdate)
        }
    }, [articleId])

    return (
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {isLoading ? initialViews : stats.views}
            </span>
            <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {isLoading ? initialLikes : stats.likes}
            </span>
            <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {comments}
            </span>
        </div>
    )
}
