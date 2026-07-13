'use client'

import { Eye, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
    ARTICLE_STATS_UPDATED_EVENT,
    type ArticleStatsUpdateDetail
} from '@/lib/article-stats-events'

interface ArticleHeaderStatsProps {
    articleId: string
    comments: number
    className?: string
}

export default function ArticleHeaderStats({
    articleId,
    comments,
    className = ""
}: ArticleHeaderStatsProps) {
    const [stats, setStats] = useState({ views: 0, likes: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const lastLiveUpdateRef = useRef(0)

    useEffect(() => {
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
        <div className={className}>
            <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {isLoading ? '-' : stats.views} 阅读
            </div>
            <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                {isLoading ? '-' : stats.likes} 点赞
            </div>
            <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {comments} 评论
            </div>
        </div>
    )
}
