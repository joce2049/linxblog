'use client'

/**
 * 文章统计「请求合并」取数器
 *
 * 背景：/api/analytics/stats 是批量接口（articleIds 逗号分隔，一次查完），
 * 但列表页每张卡片各自发一个单 id 请求，一页 20~30 张卡 → 挂载瞬间几十个并发请求，
 * 轻松打满 stats 的 100 次/分钟限流 → 大量 429。
 *
 * 本模块把「同一时间窗口内所有卡片的单 id 请求」收集起来，合并成一次批量请求，
 * 对调用方透明：卡片依旧只关心自己的 id，满屏卡片却只发 1 次（超过 100 个再分片）。
 */

export interface ArticleStat {
  views: number
  likes: number
}

// 一次批量最多携带的 id 数（与后端批量语义、限流粒度保持一致，超出则分片）
const BATCH_MAX_IDS = 100
// 合流窗口：把同一渲染帧内同步挂载的多个 effect 收进同一批
const BATCH_WINDOW_MS = 16

// 待合并队列：id -> 等待该 id 结果的 resolver 列表（同一 id 多个订阅者天然去重为一次查询）
const pending = new Map<string, Array<(stat: ArticleStat | null) => void>>()
let flushScheduled = false

function scheduleFlush() {
  if (flushScheduled) return
  flushScheduled = true
  setTimeout(flush, BATCH_WINDOW_MS)
}

function flush() {
  flushScheduled = false

  // 快照并清空当前批次，之后新进来的请求进入下一批
  const batch = new Map(pending)
  pending.clear()

  const ids = Array.from(batch.keys())
  if (ids.length === 0) return

  // 按上限分片，各片独立发请求（互不阻塞）
  for (let i = 0; i < ids.length; i += BATCH_MAX_IDS) {
    void fetchChunk(ids.slice(i, i + BATCH_MAX_IDS), batch)
  }
}

async function fetchChunk(
  chunk: string[],
  batch: Map<string, Array<(stat: ArticleStat | null) => void>>,
) {
  let statsMap: Record<string, ArticleStat> = {}
  let ok = false

  try {
    const response = await fetch(
      `/api/analytics/stats?articleIds=${chunk.map(encodeURIComponent).join(',')}`,
      { cache: 'no-store' },
    )
    if (response.ok) {
      const data = await response.json()
      statsMap = data.stats || {}
      ok = true
    } else {
      console.error(`Failed to fetch stats: ${response.status}`)
    }
  } catch (error) {
    console.error('Error batch-fetching stats:', error)
  } finally {
    // 无论成功失败都必须 resolve，避免调用方 Promise 永久挂起
    // 失败或该 id 无记录时给 null，表示「无数据，别覆盖初始值」——与原单发逻辑一致
    for (const id of chunk) {
      const stat = ok ? statsMap[id] ?? null : null
      const resolvers = batch.get(id)
      if (resolvers) resolvers.forEach((resolve) => resolve(stat))
    }
  }
}

/**
 * 请求单篇文章的统计数据；调用会被自动合并进同一时间窗口的批量请求。
 * @returns 命中则为 { views, likes }；网络失败或该 id 无记录时为 null（此时调用方应保留初始值）
 */
export function requestArticleStats(id: string): Promise<ArticleStat | null> {
  return new Promise((resolve) => {
    const list = pending.get(id)
    if (list) {
      list.push(resolve)
    } else {
      pending.set(id, [resolve])
    }
    scheduleFlush()
  })
}
