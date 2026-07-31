export const CACHE_REVALIDATE_SECONDS = 5 * 60
// last-known-good 的进程内兜底时长。放宽到 6 小时:图片 URL 的新鲜度已由客户端自愈
// （UnifiedImage onError → /api/notion-image-url 换新）保证，这里不再需要用 50 分钟去卡数据年龄，
// 反而让 Notion 短时故障时能用更久的旧文本兜底。
export const STALE_MAX_AGE_MS = 6 * 60 * 60 * 1000

// Next 14 会把回调源码纳入缓存键；绑定函数可避免不同路由打包后的变量名导致缓存分裂
export function createStableCacheCallback(loader) {
  return loader.bind(null)
}

const PROCESS_GLOBAL_IN_FLIGHT_SYMBOL = Symbol.for(
  'lindx-blog.notion.raw-loader-in-flight',
)

function getProcessGlobalInFlight() {
  const existing = globalThis[PROCESS_GLOBAL_IN_FLIGHT_SYMBOL]
  if (existing) {
    return existing
  }

  const inFlight = new Map()
  globalThis[PROCESS_GLOBAL_IN_FLIGHT_SYMBOL] = inFlight
  return inFlight
}

export function runWithProcessGlobalInFlight(key, load) {
  const inFlight = getProcessGlobalInFlight()
  const existing = inFlight.get(key)
  if (existing) {
    return existing
  }

  const promise = Promise.resolve().then(load)
  const trackedPromise = promise.finally(() => {
    if (inFlight.get(key) === trackedPromise) {
      inFlight.delete(key)
    }
  })

  inFlight.set(key, trackedPromise)
  return trackedPromise
}

export function isUsableCacheRecord(
  record,
  nowMs = Date.now(),
  maxAgeMs = STALE_MAX_AGE_MS,
) {
  if (!isStructurallyValidRecord(record)) {
    return false
  }

  const age = nowMs - record.fetchedAt
  return age >= 0 && age <= maxAgeMs
}

// 只校验记录结构是否合法（有数组 data + 有限的 fetchedAt），不看年龄。
// read() 用它替代带年龄的 isUsableCacheRecord：unstable_cache 自己会做 revalidate，
// 协调器不该因为记录「旧」就把真实数据抛掉回退到空/mock（那正是资源页「暂未配置」误报的根因）。
export function isStructurallyValidRecord(record) {
  return Boolean(
    record && Array.isArray(record.data) && Number.isFinite(record.fetchedAt),
  )
}

export function createCacheCoordinator({
  now = () => Date.now(),
  maxStaleAgeMs = STALE_MAX_AGE_MS,
  logger = console,
} = {}) {
  const inFlight = new Map()
  const lastKnownGood = new Map()

  function peek(key) {
    const record = lastKnownGood.get(key)
    if (!isUsableCacheRecord(record, now(), maxStaleAgeMs)) {
      lastKnownGood.delete(key)
      return null
    }
    return record
  }

  function read({ key, load, fallback }) {
    const existing = inFlight.get(key)
    if (existing) {
      logger.info?.(`[notion-cache] in-flight-reuse ${key}`)
      return existing
    }

    const promise = Promise.resolve()
      .then(load)
      .then((record) => {
        // 只校验结构，不因年龄抛弃：陈旧但真实的列表照常渲染（图片新鲜度交给客户端自愈）
        if (!isStructurallyValidRecord(record)) {
          throw new Error(`Invalid cache record: ${key}`)
        }

        // 抓取成功但为空、而此前已有非空数据时，视为可疑（疑似上游异常或权限抖动）：
        // 保留旧的 last-known-good，避免用空结果覆盖缓存并把空页面冻结进 ISR
        if (record.data.length === 0) {
          const prevGood = peek(key)
          if (prevGood && prevGood.data.length > 0) {
            logger.warn?.(`[notion-cache] empty-result-ignored ${key}`)
            return prevGood.data
          }
        }

        lastKnownGood.set(key, record)
        logger.info?.(`[notion-cache] shared-cache ${key}`)
        return record.data
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const stale = peek(key)
        if (stale) {
          logger.warn?.(`[notion-cache] stale-cache ${key}: ${errorMessage}`)
          return stale.data
        }

        logger.error?.(`[notion-cache] fallback ${key}: ${errorMessage}`)
        return fallback()
      })
      .finally(() => {
        inFlight.delete(key)
      })

    inFlight.set(key, promise)
    return promise
  }

  return { read, peek }
}
