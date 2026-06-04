import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// 该接口读取请求头（限流取 IP），必须动态执行；显式声明避免 Next 静态生成时抛 DYNAMIC_SERVER_USAGE
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // 速率限制检查
        const ip = getClientIp(request)
        const rateLimitResult = rateLimit(ip, rateLimitConfigs.stats)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many requests',
                    limit: rateLimitResult.limit,
                    reset: rateLimitResult.reset
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
                        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
                    }
                }
            )
        }

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
