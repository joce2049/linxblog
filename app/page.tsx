import { MessageCircle, Heart, Eye, Mail } from "lucide-react"
import { BilibiliIcon, XiaohongshuIcon } from "@/components/SocialIcons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDatabase, getCategories } from "@/lib/notion"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import HeroAnnouncement from "@/components/HeroAnnouncement"
import HomePagination from "@/components/HomePagination"
import HomeCategoryFilter from "@/components/HomeCategoryFilter"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"
import { generateArticleUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"
import nextDynamic from 'next/dynamic'

// 动态导入非关键组件，减少首屏加载时间
const ArticleStatsDisplay = nextDynamic(
  () => import('@/components/ArticleStatsDisplay'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }
)

// 启用 ISR，每 5 分钟重新验证
export const revalidate = 300

interface HomePageProps {
  searchParams: {
    page?: string
    category?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const currentPage = parseInt(searchParams.page || '1')
  const currentCategory = searchParams.category

  // 获取文章和分类数据
  const articles = await getDatabase()

  // 从文章列表中提取分类
  const categorySet = new Set<string>()
  articles.forEach((article: any) => {
    if (article.category) {
      categorySet.add(article.category)
    }
  })
  const categories = Array.from(categorySet).map(name => ({ name, color: 'default' }))

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
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/30 text-sm text-blue-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {siteConfig.notifications.banner.message}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {siteConfig.pages.home.title}
            </h1>
            <HeroAnnouncement />
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
              <Link key={article.id} href={generateArticleUrl(article.title, article.id)} prefetch={true}>
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

                      <ArticleStatsDisplay
                        articleId={article.id}
                        initialViews={0}
                        initialLikes={0}
                        comments={article.comments}
                      />
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {siteConfig.brand.name}
                </span>
                <div className="text-xs text-gray-500">{siteConfig.brand.tagline}</div>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              {siteConfig.footer.description}
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                asChild
              >
                <a
                  href="https://space.bilibili.com/173981850"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="哔哩哔哩"
                >
                  <BilibiliIcon className="w-5 h-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                asChild
              >
                <a
                  href="https://www.xiaohongshu.com/user/profile/5f70aed20000000001002f89"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="小红书"
                >
                  <XiaohongshuIcon className="w-5 h-5" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                asChild
              >
                <a
                  href="mailto:contact@linx.com"
                  aria-label="邮件联系"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </Button>
            </div>

            <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-6">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                关于本站
              </Link>
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
              <p>&copy; {siteConfig.footer.copyright.year} {siteConfig.footer.copyright.owner}. {siteConfig.footer.copyright.statement}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
