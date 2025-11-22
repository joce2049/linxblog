import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const articleIds = searchParams.get('articleIds')

        if (!articleIds) {
            return NextResponse.json(
                { error: 'Article IDs are required' },
                { status: 400 }
            )
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 503 }
            )
        }

        const ids = articleIds.split(',')

        // 批量获取统计数据
        const { data, error } = await supabase
            .from('article_stats')
            .select('article_id, views, likes')
            .in('article_id', ids)

        if (error) {
            console.error('Error fetching stats:', error)
            return NextResponse.json(
                { error: 'Failed to fetch stats' },
                { status: 500 }
            )
        }

        // 转换为 Map 格式便于查找
        const statsMap = (data || []).reduce((acc, stat) => {
            acc[stat.article_id] = {
                views: stat.views,
                likes: stat.likes
            }
            return acc
        }, {} as Record<string, { views: number; likes: number }>)

        return NextResponse.json({
            success: true,
            stats: statsMap
        })
    } catch (error) {
        console.error('Error in stats API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
