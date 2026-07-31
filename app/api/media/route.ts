import { NextRequest, NextResponse } from 'next/server'
import { getFreshImageUrl, getFreshBlockMediaUrl, getFreshImageUrlMap } from '@/lib/notion'

/**
 * 稳定媒体代理
 *
 * 把会过期的 Notion S3 直链换成永不变的站内 URL：请求时实时解析出新鲜 S3 URL 并 302 重定向。
 * 响应带 s-maxage → Vercel 边缘全球缓存该 302，绝大多数请求命中边缘、不打函数、
 * 也不经函数传字节（S3 直接把字节发给浏览器）。因此既可靠（HTML 里永无过期 URL）又省。
 *
 * 入参：?page=<pageId>（封面）或 ?block=<blockId>（正文媒体）；&v=<lastEditedTime> 仅参与
 * 缓存键，内容变更时换 key 使边缘缓存自然失效。
 *
 * 解析策略（关键：避免 Notion ~3 次/秒限流）：
 * - 封面：一次「整库 query」拿全部封面新鲜 URL（getFreshImageUrlMap），进程内缓存 5min、并发合并。
 *   一页几十张封面 → 1~2 次 Notion 调用，而非几十次。
 * - 正文媒体：按块 retrieve（一页通常没几张），配合 last-resolved 成功缓存去重。
 */

// 边缘/浏览器缓存时长：远小于 S3 URL 的 1 小时有效期，保证跟随重定向时目标至少还有 ~30min 余量。
const EDGE_MAX_AGE_S = 30 * 60

// 单条 last-resolved 缓存：成功窗口内复用免打 Notion；Notion 抖动时回退更久（仍在 1h 有效期内）的旧 URL。
const SUCCESS_TTL_MS = 10 * 60 * 1000
const RESOLVE_TTL_MS = 30 * 60 * 1000
const lastResolved = new Map<string, { url: string; at: number }>()

// 整库封面映射的进程内缓存 + 并发合并
const COVER_MAP_TTL_MS = 5 * 60 * 1000
let coverMap: Map<string, string> | null = null
let coverMapAt = 0
let coverMapInFlight: Promise<void> | null = null

async function ensureCoverMap() {
  if (coverMap && Date.now() - coverMapAt < COVER_MAP_TTL_MS) return
  if (!coverMapInFlight) {
    coverMapInFlight = getFreshImageUrlMap()
      .then((m) => {
        coverMap = m
        coverMapAt = Date.now()
      })
      .catch((error) => {
        console.error('Error warming cover map:', error instanceof Error ? error.message : error)
      })
      .finally(() => {
        coverMapInFlight = null
      })
  }
  await coverMapInFlight
}

// 封面：先查整库映射（一次 query 覆盖全部封面），漏收的页面再单独 retrieve 兜底
async function resolveCover(pageId: string): Promise<string | null> {
  await ensureCoverMap()
  return coverMap?.get(pageId) ?? (await getFreshImageUrl(pageId))
}

function redirectTo(url: string) {
  const res = NextResponse.redirect(url, 302)
  // 让 Vercel 边缘全球缓存该 302；stale-while-revalidate 仅覆盖后台重解析的极短窗口
  res.headers.set(
    'Cache-Control',
    `public, max-age=${EDGE_MAX_AGE_S}, s-maxage=${EDGE_MAX_AGE_S}, stale-while-revalidate=300`,
  )
  return res
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const pageId = searchParams.get('page')
  const blockId = searchParams.get('block')

  if (!pageId && !blockId) {
    return NextResponse.json({ error: 'page or block is required' }, { status: 400 })
  }

  const cacheKey = pageId ? `page:${pageId}` : `block:${blockId}`

  // 进程内成功缓存命中（且仍新鲜）→ 直接复用，免打 Notion
  const cached = lastResolved.get(cacheKey)
  if (cached && Date.now() - cached.at < SUCCESS_TTL_MS) {
    return redirectTo(cached.url)
  }

  try {
    const url = pageId
      ? await resolveCover(pageId)
      : await getFreshBlockMediaUrl(blockId as string)

    if (!url) {
      // 无此媒体（封面为空 / 块被删 / 未配置 Notion）：404 → <img> onError → 占位图
      return NextResponse.json({ error: 'No media for this id' }, { status: 404 })
    }

    lastResolved.set(cacheKey, { url, at: Date.now() })
    return redirectTo(url)
  } catch (error) {
    // Notion 抖动：回退到上次解析成功且仍在有效期内的 URL，避免整屏媒体因一次超时集体裂开
    const fallback = lastResolved.get(cacheKey)
    if (fallback && Date.now() - fallback.at < RESOLVE_TTL_MS) {
      return redirectTo(fallback.url)
    }
    console.error('Error resolving media url:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Failed to resolve media url' }, { status: 502 })
  }
}
