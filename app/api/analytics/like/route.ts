import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// 该接口读取请求头（限流取 IP），必须动态执行；显式声明避免 Next 静态生成时抛 DYNAMIC_SERVER_USAGE
export const dynamic = 'force-dynamic'
export const revalidate = 0

const noStoreHeaders = {
    'Cache-Control': 'no-store, max-age=0'
}

export async function POST(request: NextRequest) {
    try {
        // 速率限制检查
        const ip = getClientIp(request)
        const rateLimitResult = rateLimit(ip, rateLimitConfigs.like)

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

        const { articleId, action } = await request.json()

        if (!articleId) {
            return NextResponse.json(
                { error: 'Article ID is required' },
                { status: 400 }
            )
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase not configured' },
                { status: 503 }
            )
        }

        const functionName = action === 'unlike' ? 'decrement_likes' : 'increment_likes'

        // 调用 Supabase 函数
        const { data, error } = await supabase.rpc(functionName, {
            article_id_param: articleId
        })

        if (error) {
            console.error(`Error ${action}ing article:`, error)
            return NextResponse.json(
                { error: `Failed to ${action} article` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            views: data[0]?.views || 0,
            likes: data[0]?.likes || 0,
            action
        }, {
            headers: noStoreHeaders
        })
    } catch (error) {
        console.error('Error in like API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
