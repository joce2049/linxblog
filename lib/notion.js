import { Client } from "@notionhq/client"
import { envConfig } from "@/config/site"

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

const FORMATTED_DATABASE_ID = formatDatabaseId(DATABASE_ID)

// 内存缓存 - TTL 设置为 50 分钟 (Notion 图片链接有效期 60 分钟)
const cache = {
  database: null,
  categories: null,
  lastFetch: {
    database: null,
    categories: null
  },
  ttl: 10 * 1000 // 10秒缓存，仅用于防抖
}

// 检查缓存是否有效
function isCacheValid(key) {
  if (!cache[key] || !cache.lastFetch[key]) return false
  return Date.now() - cache.lastFetch[key] < cache.ttl
}

// 设置缓存
function setCache(key, data) {
  cache[key] = data
  cache.lastFetch[key] = Date.now()
}

// 验证必需的环境变量
if (!NOTION_API_KEY) {
  console.warn("⚠️  NOTION_API_KEY is not set. Using fallback data.")
  console.warn("📝 To connect to Notion:")
  console.warn("   1. Go to https://www.notion.so/my-integrations")
  console.warn("   2. Create a new integration and copy the API key")
  console.warn("   3. Add NOTION_API_KEY to your Project Settings > Environment Variables")
  console.warn("   4. Set the value to: secret_xxxxxxxxxx (your actual API key)")
}

if (!FORMATTED_DATABASE_ID) {
  console.warn("⚠️  NOTION_DATABASE_ID is not set. Using fallback data.")
  console.warn("📝 To set your database ID:")
  console.warn("   1. Open your Notion database")
  console.warn("   2. Copy the ID from the URL (32-character string)")
  console.warn("   3. Add NOTION_DATABASE_ID to your Project Settings > Environment Variables")
  console.warn("   4. Example: 10e560f6a07b8088809cede1dad50457")
} else {
  console.log("🔗 Using Notion database ID:", FORMATTED_DATABASE_ID)
}

const notion = NOTION_API_KEY
  ? new Client({
    auth: NOTION_API_KEY,
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

async function checkDatabasePermissions() {
  if (!notion || !FORMATTED_DATABASE_ID) {
    return { hasAccess: false, reason: "API not configured" }
  }

  try {
    // 尝试获取数据库信息来检查权限
    await notion.databases.retrieve({
      database_id: FORMATTED_DATABASE_ID,
    })
    return { hasAccess: true }
  } catch (error) {
    if (error.message.includes("Could not find database")) {
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



export async function getDatabase() {
  // 检查缓存
  if (isCacheValid('database_v3')) {
    console.log('✅ 使用缓存数据 (database_v3)')
    return cache.database_v3
  }

  if (!notion || !FORMATTED_DATABASE_ID) {
    console.log("📊 Using fallback data - Notion API not configured")
    console.log("💡 To use live Notion data, configure NOTION_API_KEY and NOTION_DATABASE_ID")
    return fallbackData
  }

  const permissionCheck = await checkDatabasePermissions()
  if (!permissionCheck.hasAccess) {
    console.error("❌ Database access failed:", permissionCheck.message)

    if (permissionCheck.reason === "database_not_shared") {
      console.error("🔧 To fix this issue:")
      console.error("   1. 打开你的Notion数据库页面")
      console.error("   2. 点击右上角的 '共享' 按钮")
      console.error("   3. 点击 '邀请' 并搜索你的集成名称")
      console.error("   4. 选择你的集成并确保权限设置为 '可以编辑'")
      console.error("   5. 点击 '邀请' 完成共享")
      console.error("")
      console.error("📋 数据库ID: " + FORMATTED_DATABASE_ID)
      console.error("🔗 集成管理: https://www.notion.so/my-integrations")
    } else if (permissionCheck.reason === "unauthorized") {
      console.error("🔧 API密钥问题:")
      console.error("   1. 检查NOTION_API_KEY是否正确")
      console.error("   2. 确保API密钥以 'secret_' 开头")
      console.error("   3. 验证集成是否仍然有效")
    }

    console.log("🔄 Using fallback data instead")
    return fallbackData
  }

  // 添加重试逻辑
  const fetchWithRetry = async (attempt = 1) => {
    try {
      console.log("[v0] Starting to fetch data from Notion...")
      console.log("🔄 Fetching from Notion database:", FORMATTED_DATABASE_ID)

      // 分页获取所有文章
      let allResults = []
      let hasMore = true
      let startCursor = undefined
      let pageCount = 0

      while (hasMore) {
        pageCount++
        console.log(`🔄 Fetching page ${pageCount}...`)

        const response = await notion.databases.query({
          database_id: FORMATTED_DATABASE_ID,
          page_size: 100,
          start_cursor: startCursor,
          sorts: [
            {
              property: envConfig.notion.properties.date,
              direction: "descending",
            },
          ],
        })

        allResults = [...allResults, ...response.results]
        hasMore = response.has_more
        startCursor = response.next_cursor

        console.log(`   📄 Page ${pageCount}: ${response.results.length} posts`)
      }

      console.log(`✅ Successfully fetched ${allResults.length} total posts from Notion (${pageCount} pages)`)
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
          title: properties[envConfig.notion.properties.title]?.title?.[0]?.plain_text || "无标题",
          description: properties[envConfig.notion.properties.description]?.rich_text?.[0]?.plain_text || "",
          content: properties[envConfig.notion.properties.content]?.rich_text?.[0]?.plain_text || "",
          format: properties[envConfig.notion.properties.format]?.multi_select?.map((item) => item.name) || [],
          category: properties[envConfig.notion.properties.category]?.select?.name || "未分类",
          tags: properties[envConfig.notion.properties.tags]?.multi_select?.map((tag) => tag.name) || [],
          image: properties[envConfig.notion.properties.image]?.files?.[0]?.file?.url ||
            properties[envConfig.notion.properties.image]?.files?.[0]?.external?.url || null,
          views: properties[envConfig.notion.properties.views]?.number || Math.floor(Math.random() * 1000) + 100,
          likes: properties[envConfig.notion.properties.likes]?.checkbox ? 100 : Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 50) + 5,
          date: properties[envConfig.notion.properties.date]?.created_time || new Date().toISOString(),
          url: properties[envConfig.notion.properties.url]?.url || "#",
          status: envConfig.notion.properties.status,
        }
      })

    console.log(`🔍 Mapped ${mappedPosts.length} posts. First post status: "${mappedPosts[0]?.status}"`)

    const posts = mappedPosts.filter((post) => post.status === "Published")
    console.log(`🔍 Published posts: ${posts.length}`)

    if (posts.length < 30) {
      console.warn("⚠️ Posts count < 30, using fallback data. Real posts:", posts.length)
      const additionalPosts = fallbackData.slice(posts.length)
      const result = [...posts, ...additionalPosts]
      setCache('database_v3', result) // 使用新缓存键
      return result
    }

    setCache('database_v3', posts) // 使用新缓存键
    return posts
  } catch (error) {
    console.error("❌ Error fetching from Notion:", error.message)

    console.log("🔄 Using fallback data instead")
    return fallbackData
  }
}

export const getCategories = async () => {
  // 1. 尝试从缓存的文章列表中提取分类（最高效，且能避免 API 错误）
  if (isCacheValid('database_v3')) {
    console.log('✅ 从文章缓存中提取分类 (database_v3)')
    const posts = cache.database_v3
    const categorySet = new Set()
    posts.forEach(post => {
      if (post.category) categorySet.add(post.category)
    })
    return Array.from(categorySet).map(name => ({ name, color: 'default' }))
  }

  // 2. 检查分类缓存
  if (isCacheValid('categories_v3')) {
    console.log('✅ 使用缓存数据 (categories_v3)')
    return cache.categories_v3
  }

  const fallbackCategories = [
    { name: "开发工具", color: "blue" },
    { name: "设计资源", color: "green" },
    { name: "学习资料", color: "orange" },
    { name: "实用工具", color: "purple" },
    { name: "前端框架", color: "red" },
  ]

  if (!notion || !FORMATTED_DATABASE_ID) {
    return fallbackCategories
  }

  try {
    const response = await notion.databases.retrieve({
      database_id: FORMATTED_DATABASE_ID,
    })

    const categoryProperty = response.properties[envConfig.notion.properties.category]
    if (categoryProperty?.type === "select") {
      const categories = categoryProperty.select.options.map((option) => ({
        name: option.name,
        color: option.color,
      }))
      setCache('categories_v3', categories)
      return categories
    }

    setCache('categories_v3', fallbackCategories)
    return fallbackCategories
  } catch (error) {
    console.error("❌ Error fetching categories:", error.message)
    return fallbackCategories
  }
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
