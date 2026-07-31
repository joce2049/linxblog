'use client'

import { useEffect, useRef, useState } from 'react'
import { dispatchArticleStatsUpdate } from '@/lib/article-stats-events'
import { requestArticleStats } from '@/lib/article-stats-batch'

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
    const viewInFlightRef = useRef(false)
    const likeInFlightRef = useRef(false)

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

            if (!hasViewed && !viewInFlightRef.current) {
                viewInFlightRef.current = true

                try {
                    const response = await fetch('/api/analytics/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ articleId }),
                        cache: 'no-store'
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to record view: ${response.status}`)
                    }

                    const data = await response.json()
                    const updatedStats = {
                        articleId,
                        views: data.views,
                        likes: data.likes
                    }

                    setStats(prev => ({
                        ...prev,
                        views: updatedStats.views,
                        likes: updatedStats.likes,
                        isLoading: false
                    }))
                    dispatchArticleStatsUpdate(updatedStats)
                    sessionStorage.setItem(viewedKey, 'true')
                } catch (error) {
                    console.error('Error recording view:', error)
                    setStats(prev => ({ ...prev, isLoading: false }))
                } finally {
                    viewInFlightRef.current = false
                }
            } else if (hasViewed) {
                // 已经记录过，只获取当前统计
                fetchStats()
            }
        }

        const fetchStats = async () => {
            try {
                const stat = await requestArticleStats(articleId) || { views: 0, likes: 0 }
                const updatedStats = {
                    articleId,
                    views: stat.views,
                    likes: stat.likes
                }

                setStats(prev => ({
                    ...prev,
                    views: updatedStats.views,
                    likes: updatedStats.likes,
                    isLoading: false
                }))
                dispatchArticleStatsUpdate(updatedStats)
            } catch (error) {
                console.error('Error fetching stats:', error)
                setStats(prev => ({ ...prev, isLoading: false }))
            }
        }

        recordView()
    }, [articleId])

    // 点赞/取消点赞
    const toggleLike = async () => {
        if (likeInFlightRef.current) return
        likeInFlightRef.current = true

        const action = stats.isLiked ? 'unlike' : 'like'
        const likedKey = `article_liked_${articleId}`

        try {
            const response = await fetch('/api/analytics/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, action }),
                cache: 'no-store'
            })

            if (!response.ok) {
                throw new Error(`Failed to toggle like: ${response.status}`)
            }

            const data = await response.json()
            const newIsLiked = !stats.isLiked
            const updatedStats = {
                articleId,
                views: data.views,
                likes: data.likes
            }

            setStats(prev => ({
                ...prev,
                views: updatedStats.views,
                likes: updatedStats.likes,
                isLiked: newIsLiked
            }))
            dispatchArticleStatsUpdate(updatedStats)

            if (newIsLiked) {
                localStorage.setItem(likedKey, 'true')
            } else {
                localStorage.removeItem(likedKey)
            }
        } catch (error) {
            console.error('Error toggling like:', error)
        } finally {
            likeInFlightRef.current = false
        }
    }

    return {
        ...stats,
        toggleLike
    }
}
