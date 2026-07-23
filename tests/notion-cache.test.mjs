import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STALE_MAX_AGE_MS,
  createCacheCoordinator,
} from '../lib/notion-cache.mjs'

const silentLogger = {
  info() {},
  warn() {},
  error() {},
}

test('不同模块实例创建的稳定缓存回调保持相同源码身份并调用各自 loader', async () => {
  const importNonce = `${Date.now()}-${Math.random()}`
  const firstModule = await import(`../lib/notion-cache.mjs?stable-callback=first-${importNonce}`)
  const secondModule = await import(`../lib/notion-cache.mjs?stable-callback=second-${importNonce}`)

  assert.equal(typeof firstModule.createStableCacheCallback, 'function')
  assert.equal(typeof secondModule.createStableCacheCallback, 'function')

  const firstCallback = firstModule.createStableCacheCallback(() => 'first-loader')
  const secondCallback = secondModule.createStableCacheCallback(() => 'second-loader')

  assert.equal(await firstCallback(), 'first-loader')
  assert.equal(await secondCallback(), 'second-loader')
  assert.equal(
    Function.prototype.toString.call(firstCallback),
    Function.prototype.toString.call(secondCallback),
  )
})

test('两个模块访问点共享同一 process-global、按 key 的真实 loader Promise', async () => {
  const importNonce = `${Date.now()}-${Math.random()}`
  const firstAccess = await import(`../lib/notion-cache.mjs?access=first-${importNonce}`)
  const secondAccess = await import(`../lib/notion-cache.mjs?access=second-${importNonce}`)

  assert.equal(typeof firstAccess.runWithProcessGlobalInFlight, 'function')
  assert.equal(typeof secondAccess.runWithProcessGlobalInFlight, 'function')

  let resolveLoad
  let loadCount = 0
  const gate = new Promise((resolve) => {
    resolveLoad = resolve
  })
  const load = () => {
    loadCount += 1
    return gate
  }

  const first = firstAccess.runWithProcessGlobalInFlight('notion-main-database-v4', load)
  const second = secondAccess.runWithProcessGlobalInFlight('notion-main-database-v4', load)

  assert.strictEqual(first, second)
  await Promise.resolve()
  assert.equal(loadCount, 1)

  const expectedRecord = { data: [{ id: '1' }], fetchedAt: Date.now() }
  resolveLoad(expectedRecord)
  assert.deepEqual(await first, expectedRecord)
})

test('process-global loader 按 key 隔离', async () => {
  const { runWithProcessGlobalInFlight } = await import('../lib/notion-cache.mjs?access=key-isolation')
  assert.equal(typeof runWithProcessGlobalInFlight, 'function')

  let mainCount = 0
  let resourcesCount = 0
  const [main, resources] = await Promise.all([
    runWithProcessGlobalInFlight('notion-main-database-v4-key-test', async () => {
      mainCount += 1
      return 'main'
    }),
    runWithProcessGlobalInFlight('notion-resources-database-v4-key-test', async () => {
      resourcesCount += 1
      return 'resources'
    }),
  ])

  assert.equal(main, 'main')
  assert.equal(resources, 'resources')
  assert.equal(mainCount, 1)
  assert.equal(resourcesCount, 1)
})

test('process-global loader 清理失败 Promise 并保留非 Error 拒绝原因', async () => {
  const { runWithProcessGlobalInFlight } = await import('../lib/notion-cache.mjs?access=rejection-cleanup')
  assert.equal(typeof runWithProcessGlobalInFlight, 'function')

  let attempts = 0
  const rejection = await runWithProcessGlobalInFlight('notion-rejection-cleanup-test', () => {
    attempts += 1
    return Promise.reject(null)
  }).then(
    () => 'unexpected-resolution',
    (reason) => reason,
  )

  assert.equal(rejection, null)
  assert.equal(await runWithProcessGlobalInFlight('notion-rejection-cleanup-test', async () => {
    attempts += 1
    return 'recovered'
  }), 'recovered')
  assert.equal(attempts, 2)
})

test('同一缓存键的并发请求只执行一次加载器', async () => {
  let resolveLoad
  let loadCount = 0
  const gate = new Promise((resolve) => {
    resolveLoad = resolve
  })
  const coordinator = createCacheCoordinator({ logger: silentLogger })

  const load = async () => {
    loadCount += 1
    return gate
  }

  const first = coordinator.read({
    key: 'main',
    load,
    fallback: () => [],
  })
  const second = coordinator.read({
    key: 'main',
    load,
    fallback: () => [],
  })

  await Promise.resolve()
  assert.equal(loadCount, 1)

  resolveLoad({ data: [{ id: '1' }], fetchedAt: Date.now() })
  assert.deepEqual(await first, [{ id: '1' }])
  assert.deepEqual(await second, [{ id: '1' }])
})

test('加载失败时返回 50 分钟内的 last-known-good', async () => {
  let now = 1_000
  const coordinator = createCacheCoordinator({
    now: () => now,
    logger: silentLogger,
  })

  const data = [{ id: 'fresh' }]
  assert.deepEqual(await coordinator.read({
    key: 'main',
    load: async () => ({ data, fetchedAt: now }),
    fallback: () => [{ id: 'fallback' }],
  }), data)

  now += STALE_MAX_AGE_MS
  assert.deepEqual(await coordinator.read({
    key: 'main',
    load: async () => {
      throw new Error('Notion unavailable')
    },
    fallback: () => [{ id: 'fallback' }],
  }), data)
})

test('超过 50 分钟的 stale 被拒绝并返回业务 fallback', async () => {
  let now = 2_000
  const coordinator = createCacheCoordinator({
    now: () => now,
    logger: silentLogger,
  })

  await coordinator.read({
    key: 'main',
    load: async () => ({ data: [{ id: 'old' }], fetchedAt: now }),
    fallback: () => [],
  })

  now += STALE_MAX_AGE_MS + 1
  const result = await coordinator.read({
    key: 'main',
    load: async () => {
      throw new Error('Notion unavailable')
    },
    fallback: () => [{ id: 'fallback' }],
  })

  assert.deepEqual(result, [{ id: 'fallback' }])
  assert.equal(coordinator.peek('main'), null)
})

test('无效共享缓存记录不会成为 last-known-good', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  const fallback = [{ id: 'fallback' }]

  const result = await coordinator.read({
    key: 'main',
    load: async () => ({ data: 'wrong-type', fetchedAt: Date.now() }),
    fallback: () => fallback,
  })

  assert.deepEqual(result, fallback)
  assert.equal(coordinator.peek('main'), null)
})

test('失败 Promise 会被清理，后续请求可以重新加载', async () => {
  let attempts = 0
  const coordinator = createCacheCoordinator({ logger: silentLogger })

  assert.deepEqual(await coordinator.read({
    key: 'main',
    load: async () => {
      attempts += 1
      throw new Error('temporary failure')
    },
    fallback: () => [],
  }), [])

  assert.deepEqual(await coordinator.read({
    key: 'main',
    load: async () => {
      attempts += 1
      return { data: [{ id: 'recovered' }], fetchedAt: Date.now() }
    },
    fallback: () => [],
  }), [{ id: 'recovered' }])

  assert.equal(attempts, 2)
})

test('加载器以 null 拒绝且无 stale 时返回业务 fallback', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  const fallback = [{ id: 'fallback' }]

  const result = await coordinator.read({
    key: 'main',
    load: () => Promise.reject(null),
    fallback: () => fallback,
  })

  assert.deepEqual(result, fallback)
})

test('加载器以 undefined 拒绝时返回可用的 last-known-good', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  const stale = [{ id: 'stale' }]

  await coordinator.read({
    key: 'main',
    load: async () => ({ data: stale, fetchedAt: Date.now() }),
    fallback: () => [],
  })

  const result = await coordinator.read({
    key: 'main',
    load: () => Promise.reject(undefined),
    fallback: () => [{ id: 'fallback' }],
  })

  assert.deepEqual(result, stale)
})

test('不同缓存键不会复用数据或 in-flight Promise', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  let mainCount = 0
  let resourcesCount = 0

  const [main, resources] = await Promise.all([
    coordinator.read({
      key: 'main',
      load: async () => {
        mainCount += 1
        return { data: [{ id: 'article' }], fetchedAt: Date.now() }
      },
      fallback: () => [],
    }),
    coordinator.read({
      key: 'resources',
      load: async () => {
        resourcesCount += 1
        return { data: [{ id: 'resource' }], fetchedAt: Date.now() }
      },
      fallback: () => [],
    }),
  ])

  assert.deepEqual(main, [{ id: 'article' }])
  assert.deepEqual(resources, [{ id: 'resource' }])
  assert.equal(mainCount, 1)
  assert.equal(resourcesCount, 1)
})

test('合法空数组可以作为成功的共享缓存记录', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  const result = await coordinator.read({
    key: 'resources',
    load: async () => ({ data: [], fetchedAt: Date.now() }),
    fallback: () => [{ id: 'fallback' }],
  })

  assert.deepEqual(result, [])
})

test('分类数组结构会被原样保留', async () => {
  const coordinator = createCacheCoordinator({ logger: silentLogger })
  const categories = [{ name: '视频', color: 'blue' }]
  const result = await coordinator.read({
    key: 'main-categories',
    load: async () => ({ data: categories, fetchedAt: Date.now() }),
    fallback: () => [],
  })

  assert.deepEqual(result, categories)
})
