import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json()

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

        // 调用 Supabase 函数递增阅读量
        const { data, error } = await supabase.rpc('increment_views', {
            article_id_param: articleId
        })

        if (error) {
            console.error('Error incrementing views:', error)
            return NextResponse.json(
                { error: 'Failed to increment views' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            views: data[0]?.views || 0,
            likes: data[0]?.likes || 0
        })
    } catch (error) {
        console.error('Error in view API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
