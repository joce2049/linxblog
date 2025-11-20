import { MessageCircle, Heart, Eye, Github, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatabase, getCategories } from "@/lib/notion"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import HomePagination from "@/components/HomePagination"
import HomeCategoryFilter from "@/components/HomeCategoryFilter"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"
import { generateArticleUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"

// 强制动态渲染，确保每次请求都获取最新的 Notion 图片 URL
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HomePageProps {
  searchParams: {
    page?: string
    category?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  console.log("[v0] Starting to fetch data from Notion...")

  const currentPage = parseInt(searchParams.page || '1')
  const currentCategory = searchParams.category
  let articles = []
  let categories = []
  let notionError = null
  let isConnected = false

  try {
    // 改为串行获取，避免 Notion Client 在 Next.js 环境下的并发 fetch 问题
    articles = await getDatabase()

    // 从文章列表中提取分类，避免额外的 API 调用和潜在的 fetch 错误
    const categorySet = new Set<string>()
    articles.forEach((article: any) => {
      if (article.category) {
        categorySet.add(article.category)
      }
    })
    categories = Array.from(categorySet).map(name => ({ name, color: 'default' }))

    isConnected = articles.length > 0 && articles[0].id !== "1" // First fallback article has id "1"
    console.log("[v0] Successfully fetched", articles.length, "articles and", categories.length, "categories")
  } catch (error) {
    console.error("[v0] Error fetching data:", error)
    notionError = error instanceof Error ? error.message : String(error)
    // 使用空数组作为回退，getDatabase 和 getCategories 已经处理了回退逻辑
    articles = await getDatabase()
    categories = (await getCategories()) || []
  }

  const hasApiKey = !!process.env.NOTION_API_KEY
  const hasDatabaseId = !!process.env.NOTION_DATABASE_ID

  // 分类筛选逻辑
  let filteredArticles = articles
  if (currentCategory) {
    filteredArticles = filteredArticles.filter((article: any) => article.category === currentCategory)
  }

  // 分页逻辑
  const itemsPerPage = siteConfig.pages.home.pagination.itemsPerPage
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/30 text-sm text-blue-600 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID ? "实时同步Notion数据" : "演示数据模式"}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              LinX 后期工坊
              <br />
              <span className="text-2xl md:text-3xl font-normal text-gray-600">记录学习与成长</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
              {process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID
                ? "基于 Notion 数据库构建的知识分享平台，专注于优质资源收集与知识传播"
                : "演示模式 - 配置 Notion API 后可实时同步数据"}
            </p>
          </div>
        </div>
      </section>

      <main className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 py-8">


        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <div className="text-sm text-gray-500">
              共 {filteredArticles.length} 篇文章
              {currentCategory && <span className="text-blue-600 ml-2">• 分类：{currentCategory}</span>}
              {!process.env.NOTION_API_KEY && <span className="text-orange-500 ml-2">(演示数据)</span>}
            </div>
          </div>
          <HomeCategoryFilter
            currentCategory={currentCategory}
            totalCount={articles.length}
          />
        </div>

        <div className={`grid gap-6 ${siteConfig.pages.home.grid.columns}`}>
          {currentArticles.length > 0 ? (
            currentArticles.map((article: any) => (
              <Link key={article.id} href={generateArticleUrl(article.title, article.id)}>
                <Card className="bg-white/80 backdrop-blur-sm flex flex-col gap-0 py-0 px-0 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer overflow-hidden group border-0 rounded-xl">
                  <div className="relative overflow-hidden">
                    {article.image && (
                      <UnifiedImage
                        src={article.image}
                        alt={article.title}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <CardContent className="p-0">
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {article.tags.map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border-0 rounded-md"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1 hover:text-green-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>{article.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            // 显示骨架屏
            Array.from({ length: siteConfig.pages.home.pagination.itemsPerPage }).map((_, index) => (
              <ArticleCardSkeleton key={index} />
            ))
          )}
        </div>

        <HomePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredArticles.length}
          itemsPerPage={itemsPerPage}
        />
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-white/30 mt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LinX 后期工坊
                </span>
                <div className="text-xs text-gray-500">基于Notion构建</div>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              基于 Notion 数据库的知识分享平台，专注于优质内容收集与传播
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600">
                <Mail className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-6">
              <a href="#" className="hover:text-blue-600 transition-colors">
                关于本站
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                友情链接
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                隐私政策
              </a>
              <a href="#" className="hover:text-blue-600 transition-colors">
                RSS订阅
              </a>
            </div>

            <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>&copy; 2024 LinX 后期工坊. Powered by Notion API & Next.js.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
