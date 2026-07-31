import { Client } from "@notionhq/client"
import { unstable_cache } from "next/cache"
import { envConfig } from "@/config/site"
import {
  CACHE_REVALIDATE_SECONDS,
  createCacheCoordinator,
  createStableCacheCallback,
  runWithProcessGlobalInFlight,
} from "@/lib/notion-cache.mjs"

const NOTION_API_KEY = envConfig.notion.apiKey
const DATABASE_ID = envConfig.notion.databaseId

function formatDatabaseId(id) {
  if (!id) return null

  // 如果是完整的Notion URL，提取数据库ID
  if (id.includes("notion.so")) {
    const match = id.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
    if (match) {
      id = match[1]
    }
  }

  // 移除连字符，确保是32位字符串
  const cleanId = id.replace(/-/g, "")

  // 如果是32位字符串，转换为标准UUID格式
  if (cleanId.length === 32) {
    return `${cleanId.slice(0, 8)}-${cleanId.slice(8, 12)}-${cleanId.slice(12, 16)}-${cleanId.slice(16, 20)}-${cleanId.slice(20, 32)}`
  }

  return id
}

// 瞬时错误：超时、限流、Notion 5xx、网络抖动 —— 值得指数退避重试
// 永久错误：库未共享 / 未授权 / 参数非法 —— 重试无意义，应立即失败
const TRANSIENT_NOTION_ERROR_CODES = new Set([
  "notionhq_client_request_timeout", // 客户端请求超时
  "notionhq_client_response_error",  // 响应解析 / 传输层错误
  "rate_limited",                    // 触发限流（429）
  "internal_server_error",           // Notion 5xx
  "service_unavailable",
  "bad_gateway",
  "gateway_timeout",
  "database_connection_unavailable",
  "conflict_error",                  // 并发冲突，可重试
])

/**
 * 判断 Notion 抓取错误是否为瞬时错误（值得重试）
 * @param {any} error
 * @returns {boolean}
 */
function isTransientNotionError(error) {
  if (!error) return false

  // 1) 已知的瞬时 Notion 错误码
  if (error.code && TRANSIENT_NOTION_ERROR_CODES.has(error.code)) {
    return true
  }

  // 2) HTTP 429 / 5xx 一律视为瞬时
  if (typeof error.status === "number" && (error.status === 429 || error.status >= 500)) {
    return true
  }

  // 3) 无 Notion 错误码、无 HTTP 状态的原生网络错误（fetch 失败、连接重置等）按瞬时处理，交给重试兜底
  if (!error.code && error.status === undefined) {
    return (
      error.name === "FetchError" ||
      error.name === "TypeError" ||
      /timeout|network|ECONN|socket|fetch failed/i.test(error.message || "")
    )
  }

  // 其余（object_not_found / unauthorized / validation_error 等）为永久性错误
  return false
}

/**
 * 生成可读的 Notion 错误描述，便于日志排查
 * @param {any} error
 * @returns {string}
 */
function describeNotionError(error) {
  if (!error) return "unknown error"
  const parts = []
  if (error.code) parts.push(`code=${error.code}`)
  if (error.status !== undefined) parts.push(`status=${error.status}`)
  parts.push(error.message || String(error))
  return parts.join(" ")
}

// 主文章库与学习资源库：共用同一个集成 API Key，仅数据库 ID 不同
const FORMATTED_DATABASE_ID = formatDatabaseId(DATABASE_ID)
const FORMATTED_RESOURCES_DATABASE_ID = formatDatabaseId(envConfig.notion.resourcesDatabaseId)

// 从 Notion 页面属性里提取封面图 URL（file 优先，其次 external），统一 map 与按需刷新两处逻辑
function extractImageUrl(properties, imageProp) {
  const file = properties?.[imageProp]?.files?.[0]
  return file?.file?.url || file?.external?.url || null
}

const CACHE_KEYS = {
  mainDatabase: "notion-main-database-v4",
  mainCategories: "notion-main-categories-v4",
  resourcesDatabase: "notion-resources-database-v4",
  resourcesCategories: "notion-resources-categories-v4",
}

const cacheCoordinator = createCacheCoordinator()

// 验证必需的环境变量（生产环境应该已配置）
const notion = NOTION_API_KEY
  ? new Client({
    auth: NOTION_API_KEY,
    timeoutMs: 30000, // 设置 30 秒超时（默认是 60 秒，但在 Vercel 可能需要更短）
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  })
  : null

const fallbackData = [
  {
    id: "1",
    title: "前端开发工具集合",
    description: "收集了最实用的前端开发工具，包括代码编辑器、调试工具、性能优化工具等，帮助开发者提高工作效率。",
    category: "开发工具",
    tags: ["前端", "工具", "开发"],
    image: "/frontend-dev-tools.png",
    views: 1234,
    likes: 89,
    comments: 23,
    date: new Date().toISOString(),
    url: "#",
    status: "Published",
  },
  {
    id: "2",
    title: "React组件库推荐",
    description: "精选的React组件库，包括UI框架、图标库、动画库等，让你的React项目开发更加高效。",
    category: "前端框架",
    tags: ["React", "组件", "UI"],
    image: "/react-component-library.png",
    views: 987,
    likes: 67,
    comments: 15,
    date: new Date().toISOString(),
    url: "#",
    status: "Published",
  },
  // 添加更多回退数据以满足6行5列的需求
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `${i + 3}`,
    title: `实用资源 ${i + 3}`,
    description: `这是第${i + 3}个实用资源的描述，包含了丰富的内容和有价值的信息。`,
    category: ["设计资源", "开发工具", "学习资料", "实用工具"][i % 4],
    tags: ["工具", "资源", "实用"],
    image: null,
    views: Math.floor(Math.random() * 1000) + 100,
    likes: Math.floor(Math.random() * 100) + 10,
    comments: Math.floor(Math.random() * 50) + 5,
    date: new Date().toISOString(),
    url: "#",
    status: "Published",
  })),
]

// 主库分类回退数据（API 不可用时使用；学习资源库不使用这些假分类）
const fallbackCategories = [
  { name: "开发工具", color: "blue" },
  { name: "设计资源", color: "green" },
  { name: "学习资料", color: "orange" },
  { name: "实用工具", color: "purple" },
  { name: "前端框架", color: "red" },
]

/**
 * 通用数据库拉取：按数据库 ID 查询 → 映射 → 过滤 Published
 * @param {string} databaseId 已格式化的数据库 ID
 * @param {object} options
 * @param {string} options.cacheKey 缓存键（按库隔离，避免两个库互相覆盖）
 * @param {boolean} [options.fillToThirty] 真实文章不足 30 篇时是否用 mock 数据填充（仅主库需要）
 * @param {object} [options.props] Notion 属性映射
 */
async function fetchDatabaseFromNotion(
  databaseId,
  { cacheKey, fillToThirty = false, props = envConfig.notion.properties },
) {
  if (!notion || !databaseId) {
    throw new Error(`Notion API not configured for ${cacheKey}`)
  }

  // 直接抓取：databases.query 本身会在库未共享/无权限时抛 object_not_found / unauthorized，
  // 无需额外的 databases.retrieve 预检（那次调用无重试，任何瞬时错误都会把整次抓取降级为空）
  // 重试逻辑（含瞬时错误分类与指数退避）
  const fetchWithRetry = async (attempt = 1) => {
    try {
      console.log("🔄 Fetching from Notion database:", databaseId)

      // 分页获取所有文章
      let allResults = []
      let hasMore = true
      let startCursor = undefined
      let pageCount = 0

      while (hasMore) {
        pageCount++
        const response = await notion.databases.query({
          database_id: databaseId,
          page_size: 100,
          start_cursor: startCursor,
          sorts: [
            {
              timestamp: "last_edited_time",
              direction: "descending",
            },
          ],
        })

        allResults = [...allResults, ...response.results]
        hasMore = response.has_more
        startCursor = response.next_cursor

        console.log(`   📄 Page ${pageCount}: ${response.results.length} posts`)
      }

      console.log(`✅ Successfully fetched ${allResults.length} total posts (${pageCount} pages)`)
      return allResults
    } catch (error) {
      // 永久性错误（权限 / 找不到库等）立即失败，不浪费重试次数
      if (!isTransientNotionError(error)) {
        console.error(`❌ 抓取失败（永久性错误，不重试）：`, describeNotionError(error))
        throw error
      }
      if (attempt < envConfig.notion.fetch.maxRetries) {
        // 指数退避：1s → 2s → 4s，缓解限流与瞬时抖动
        const delay = envConfig.notion.fetch.retryDelay * Math.pow(2, attempt - 1)
        console.warn(`⚠️ 第 ${attempt}/${envConfig.notion.fetch.maxRetries} 次抓取失败（${error.code || "network"}），${delay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchWithRetry(attempt + 1)
      }
      throw error
    }
  }

  try {
    const allResults = await fetchWithRetry()
    const validPages = allResults.filter((page) => page && page.properties) // 过滤掉没有 properties 的页面
    console.log(`🔍 Valid pages from Notion: ${validPages.length}`)

    const mappedPosts = validPages
      .map((page) => {
        const properties = page.properties

        return {
          id: page.id,
          title: properties[props.title]?.title?.[0]?.plain_text || "无标题",
          description: properties[props.description]?.rich_text?.[0]?.plain_text || "",
          content: properties[props.content]?.rich_text?.[0]?.plain_text || "",
          format: properties[props.format]?.multi_select?.map((item) => item.name) || [],
          category: properties[props.category]?.select?.name || "未分类",
          tags: properties[props.tags]?.multi_select?.map((tag) => tag.name) || [],
          image: extractImageUrl(properties, props.image),
          views: properties[props.views]?.number || 0,
          likes: properties[props.likes]?.checkbox ? 100 : Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          extractCode: properties[props.extractCode]?.rich_text?.[0]?.plain_text || "",
          date: properties[props.date]?.created_time || page.created_time || new Date().toISOString(),
          lastEditedTime: page.last_edited_time || new Date().toISOString(),
          url: properties[props.url]?.url || "#",
          status: props.status,
        }
      })

    const posts = mappedPosts.filter((post) => post.status === "Published")
    console.log(`🔍 Published posts (${cacheKey}): ${posts.length}`)

    // 仅主库在真实文章不足时用 mock 填充；资源库保持真实条目数，避免混入示例文章
    const data = fillToThirty && posts.length < 30
      ? [...posts, ...fallbackData.slice(posts.length)]
      : posts

    console.log(`[notion-cache] notion-fetch-success ${cacheKey}`)
    return {
      data,
      fetchedAt: Date.now(),
    }
  } catch (error) {
    console.error(`[notion-cache] notion-fetch-failed ${cacheKey}:`, describeNotionError(error))
    throw error
  }
}

/**
 * 通用分类提取：retrieve 数据库 select 选项
 */
async function fetchCategoriesFromNotion(
  databaseId,
  { cacheKey, categoryProp = envConfig.notion.properties.category },
) {
  if (!notion || !databaseId) {
    throw new Error(`Notion API not configured for ${cacheKey}`)
  }

  try {
    const response = await notion.databases.retrieve({
      database_id: databaseId,
    })

    const categoryProperty = response.properties[categoryProp]
    if (categoryProperty?.type !== "select") {
      throw new Error(`Category property is not select: ${categoryProp}`)
    }

    return {
      data: categoryProperty.select.options.map((option) => ({
        name: option.name,
        color: option.color,
      })),
      fetchedAt: Date.now(),
    }
  } catch (error) {
    console.error(`[notion-cache] category-fetch-failed ${cacheKey}:`, error.message)
    throw error
  }
}

const loadMainDatabase = unstable_cache(
  createStableCacheCallback(() => runWithProcessGlobalInFlight(
    CACHE_KEYS.mainDatabase,
    () => fetchDatabaseFromNotion(FORMATTED_DATABASE_ID, {
      cacheKey: CACHE_KEYS.mainDatabase,
      fillToThirty: true,
      props: envConfig.notion.properties,
    }),
  )),
  [CACHE_KEYS.mainDatabase],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_KEYS.mainDatabase],
  },
)

const loadMainCategories = unstable_cache(
  createStableCacheCallback(() => runWithProcessGlobalInFlight(
    CACHE_KEYS.mainCategories,
    () => fetchCategoriesFromNotion(FORMATTED_DATABASE_ID, {
      cacheKey: CACHE_KEYS.mainCategories,
      categoryProp: envConfig.notion.properties.category,
    }),
  )),
  [CACHE_KEYS.mainCategories],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_KEYS.mainCategories],
  },
)

const loadResourcesDatabase = unstable_cache(
  createStableCacheCallback(() => runWithProcessGlobalInFlight(
    CACHE_KEYS.resourcesDatabase,
    () => fetchDatabaseFromNotion(FORMATTED_RESOURCES_DATABASE_ID, {
      cacheKey: CACHE_KEYS.resourcesDatabase,
      fillToThirty: false,
      props: envConfig.notion.resourcesProperties,
    }),
  )),
  [CACHE_KEYS.resourcesDatabase],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_KEYS.resourcesDatabase],
  },
)

const loadResourcesCategories = unstable_cache(
  createStableCacheCallback(() => runWithProcessGlobalInFlight(
    CACHE_KEYS.resourcesCategories,
    () => fetchCategoriesFromNotion(FORMATTED_RESOURCES_DATABASE_ID, {
      cacheKey: CACHE_KEYS.resourcesCategories,
      categoryProp: envConfig.notion.resourcesProperties.category,
    }),
  )),
  [CACHE_KEYS.resourcesCategories],
  {
    revalidate: CACHE_REVALIDATE_SECONDS,
    tags: [CACHE_KEYS.resourcesCategories],
  },
)

// ==================== 主文章库 ====================

export function getDatabase() {
  return cacheCoordinator.read({
    key: CACHE_KEYS.mainDatabase,
    load: loadMainDatabase,
    fallback: () => fallbackData,
  })
}

export function getCategories() {
  const postsRecord = cacheCoordinator.peek(CACHE_KEYS.mainDatabase)
  if (postsRecord) {
    const categorySet = new Set()
    postsRecord.data.forEach((post) => {
      if (post.category) categorySet.add(post.category)
    })
    return Promise.resolve(
      Array.from(categorySet).map((name) => ({ name, color: "default" })),
    )
  }

  return cacheCoordinator.read({
    key: CACHE_KEYS.mainCategories,
    load: loadMainCategories,
    fallback: () => fallbackCategories,
  })
}

// ==================== 学习资源库 ====================

export function getResourcesDatabase() {
  return cacheCoordinator.read({
    key: CACHE_KEYS.resourcesDatabase,
    load: loadResourcesDatabase,
    fallback: () => [],
  })
}

export function getResourcesCategories() {
  const postsRecord = cacheCoordinator.peek(CACHE_KEYS.resourcesDatabase)
  if (postsRecord) {
    const categorySet = new Set()
    postsRecord.data.forEach((post) => {
      if (post.category) categorySet.add(post.category)
    })
    return Promise.resolve(
      Array.from(categorySet).map((name) => ({ name, color: "default" })),
    )
  }

  return cacheCoordinator.read({
    key: CACHE_KEYS.resourcesCategories,
    load: loadResourcesCategories,
    fallback: () => [],
  })
}

export async function getTags() {
  const fallbackTags = [
    { name: "前端", color: "blue" },
    { name: "后端", color: "green" },
    { name: "设计", color: "purple" },
    { name: "工具", color: "orange" },
    { name: "学习", color: "red" },
  ]

  if (!notion || !FORMATTED_DATABASE_ID) {
    return fallbackTags
  }

  try {
    const response = await notion.databases.retrieve({
      database_id: FORMATTED_DATABASE_ID,
    })

    const tagsProperty = response.properties[envConfig.notion.properties.tags]
    if (tagsProperty?.type === "multi_select") {
      return tagsProperty.multi_select.options.map((option) => ({
        name: option.name,
        color: option.color,
      }))
    }

    return fallbackTags
  } catch (error) {
    console.error("❌ Error fetching tags:", error.message)
    return fallbackTags
  }
}

// ==================== 按需刷新封面图 URL ====================

/**
 * 按 Notion 页面 ID 实时取一个新鲜的封面图 URL。
 * Notion 每次 pages.retrieve 都会重新签发 S3 预签名 URL（有效期 1 小时），
 * 供 /api/notion-image-url 在客户端图片过期（403）时按需换新，绕开各层缓存里被冻结的旧 URL。
 * 主库与资源库封面列名相同（都是「封面」），故默认用 properties.image 即可通吃。
 * @param {string} pageId Notion 页面 ID
 * @returns {Promise<string|null>} 新鲜的图片 URL；无封面或未配置时为 null
 */
export async function getFreshImageUrl(pageId) {
  if (!notion || !pageId) return null

  const page = await notion.pages.retrieve({ page_id: pageId })
  return extractImageUrl(page.properties, envConfig.notion.properties.image)
}
