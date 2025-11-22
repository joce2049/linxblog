'use client'

import { useEffect, useState } from 'react'

interface ArticleStats {
    views: number
    likes: number
    isLiked: boolean
    isLoading: boolean
}

export function useArticleStats(articleId: string) {
    const [stats, setStats] = useState<ArticleStats>({
        views: 0,
        likes: 0,
        isLiked: false,
        isLoading: true
    })

    // 检查是否已点赞
    useEffect(() => {
        const likedKey = `article_liked_${articleId}`
        const hasLiked = localStorage.getItem(likedKey) === 'true'
        setStats(prev => ({ ...prev, isLiked: hasLiked }))
    }, [articleId])

    // 记录阅读量（仅一次）
    useEffect(() => {
        const recordView = async () => {
            const viewedKey = `article_viewed_${articleId}`
            const hasViewed = sessionStorage.getItem(viewedKey)

            if (!hasViewed) {
                try {
                    const response = await fetch('/api/analytics/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articleId })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setStats(prev => ({
                            ...prev,
                            views: data.views,
                            likes: data.likes,
                            isLoading: false
                        }))
                        sessionStorage.setItem(viewedKey, 'true')
                    }
                } catch (error) {
                    console.error('Error recording view:', error)
                    setStats(prev => ({ ...prev, isLoading: false }))
                }
            } else {
                // 已经记录过，只获取当前统计
                fetchStats()
            }
        }

        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/analytics/stats?articleIds=${articleId}`)
                if (response.ok) {
                    const data = await response.json()
                    const stat = data.stats[articleId] || { views: 0, likes: 0 }
                    setStats(prev => ({
                        ...prev,
                        views: stat.views,
                        likes: stat.likes,
                        isLoading: false
                    }))
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
                setStats(prev => ({ ...prev, isLoading: false }))
            }
        }

        recordView()
    }, [articleId])

    // 点赞/取消点赞
    const toggleLike = async () => {
        const action = stats.isLiked ? 'unlike' : 'like'
        const likedKey = `article_liked_${articleId}`

        try {
            const response = await fetch('/api/analytics/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, action })
            })

            if (response.ok) {
                const data = await response.json()
                const newIsLiked = !stats.isLiked

                setStats(prev => ({
                    ...prev,
                    likes: data.likes,
                    isLiked: newIsLiked
                }))

                if (newIsLiked) {
                    localStorage.setItem(likedKey, 'true')
                } else {
                    localStorage.removeItem(likedKey)
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        }
    }

    return {
        ...stats,
        toggleLike
    }
}
