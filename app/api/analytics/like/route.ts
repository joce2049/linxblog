import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
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
        })
    } catch (error) {
        console.error('Error in like API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
