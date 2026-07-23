export const CACHE_REVALIDATE_SECONDS = 5 * 60
export const STALE_MAX_AGE_MS = 50 * 60 * 1000

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
  if (!record || !Array.isArray(record.data) || !Number.isFinite(record.fetchedAt)) {
    return false
  }

  const age = nowMs - record.fetchedAt
  return age >= 0 && age <= maxAgeMs
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
        if (!isUsableCacheRecord(record, now(), maxStaleAgeMs)) {
          throw new Error(`Invalid or expired cache record: ${key}`)
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
