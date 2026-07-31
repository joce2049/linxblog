import { NextRequest, NextResponse } from 'next/server'
import { getFreshImageUrl } from '@/lib/notion'
import { rateLimit, getClientIp, rateLimitConfigs } from '@/lib/rate-limit'

// 读取请求头（限流取 IP）+ 实时向 Notion 取新鲜 URL，必须动态执行
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 进程内短缓存：对同一 pageId 去重，避免一张陈旧 ISR 页多图并发自愈时重复打 Notion。
// 缓存的是「新鲜 URL」本身，TTL 5 分钟 << S3 URL 的 1 小时有效期，绝不会缓存到过期链接。
const IMAGE_URL_TTL_MS = 5 * 60 * 1000
const freshUrlCache = new Map<string, { url: string; expiresAt: number }>()

export async function GET(request: NextRequest) {
    // 速率限制，防滥用
    const ip = getClientIp(request)
    const rl = rateLimit(ip, rateLimitConfigs.imageUrl)
    if (!rl.success) {
        return NextResponse.json(
            { error: 'Too many requests', reset: rl.reset },
            { status: 429, headers: { 'X-RateLimit-Reset': rl.reset.toString() } },
        )
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // 命中进程内短缓存直接返回
    const cached = freshUrlCache.get(id)
    if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({ url: cached.url }, { headers: shortCacheHeaders })
    }

    try {
        const url = await getFreshImageUrl(id)
        if (!url) {
            // 该页无封面（或未配置 Notion）：404，客户端会落到占位图
            return NextResponse.json({ error: 'No image for this page' }, { status: 404 })
        }

        freshUrlCache.set(id, { url, expiresAt: Date.now() + IMAGE_URL_TTL_MS })
        return NextResponse.json({ url }, { headers: shortCacheHeaders })
    } catch (error) {
        console.error('Error resolving fresh image url:', error instanceof Error ? error.message : error)
        return NextResponse.json({ error: 'Failed to resolve image url' }, { status: 500 })
    }
}

// 允许浏览器/CDN 短暂缓存该响应（远小于 URL 1 小时有效期），进一步削峰
const shortCacheHeaders = {
    'Cache-Control': 'public, max-age=300',
}
