'use client'

import { Eye, Heart, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

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

    useEffect(() => {
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
