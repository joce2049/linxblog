'use client'

import { Eye, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

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

    useEffect(() => {
        // 获取最新统计数据
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/analytics/stats?articleIds=${articleId}`)
                if (response.ok) {
                    const data = await response.json()
                    const stat = data.stats[articleId]
                    if (stat) {
                        setStats({ views: stat.views, likes: stat.likes })
                    }
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStats()
    }, [articleId])

    return (
        <div className="flex items-center gap-4 text-gray-500 text-sm">
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
