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

// 主文章库与学习资源库：共用同一个集成 API Key，仅数据库 ID 不同
const FORMATTED_DATABASE_ID = formatDatabaseId(DATABASE_ID)
const FORMATTED_RESOURCES_DATABASE_ID = formatDatabaseId(envConfig.notion.resourcesDatabaseId)

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

async function checkDatabasePermissions(databaseId) {
  if (!notion || !databaseId) {
    return { hasAccess: false, reason: "API not configured" }
  }

  try {
    // 尝试获取数据库信息来检查权限
    await notion.databases.retrieve({
      database_id: databaseId,
    })
    return { hasAccess: true }
  } catch (error) {
    if (error.code === 'notionhq_client_request_timeout') {
      return {
        hasAccess: false,
        reason: "timeout",
        message: "连接 Notion API 超时，将自动重试",
      }
    } else if (error.message.includes("Could not find database")) {
      return {
        hasAccess: false,
        reason: "database_not_shared",
        message: "数据库未与集成共享或不存在",
      }
    } else if (error.message.includes("Unauthorized")) {
      return {
        hasAccess: false,
        reason: "unauthorized",
        message: "API密钥无效或权限不足",
      }
    }
    return {
      hasAccess: false,
      reason: "unknown",
      message: error.message,
    }
  }
}

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

  const permissionCheck = await checkDatabasePermissions(databaseId)
  if (!permissionCheck.hasAccess) {
    // 如果是超时错误，只警告但继续尝试获取数据
    if (permissionCheck.reason === "timeout") {
      console.warn("⚠️", permissionCheck.message)
    } else {
      throw new Error(permissionCheck.message || `Database access failed: ${cacheKey}`)
    }
  }

  // 添加重试逻辑
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
      console.error(`❌ Attempt ${attempt} failed:`, error.message)
      if (attempt < envConfig.notion.fetch.maxRetries) {
        console.log(`⚠️ Attempt ${attempt} failed, retrying in ${envConfig.notion.fetch.retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, envConfig.notion.fetch.retryDelay))
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
          image: properties[props.image]?.files?.[0]?.file?.url ||
            properties[props.image]?.files?.[0]?.external?.url || null,
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
    console.error(`[notion-cache] notion-fetch-failed ${cacheKey}:`, error.message)
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
