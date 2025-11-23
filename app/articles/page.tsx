import { getDatabase, getCategories } from "@/lib/notion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Heart, MessageCircle, Calendar } from "lucide-react"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import SortSelector from "@/components/SortSelector"
import ConfigurableCategoryFilter from "@/components/ConfigurableCategoryFilter"
import TagFilter from "@/components/TagFilter"
import Pagination from "@/components/Pagination"
import ClearFiltersButton from "@/components/ClearFiltersButton"
import DownloadButton from "@/components/DownloadButton"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"
import { generateArticleUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import Image from "next/image"
import nextDynamic from 'next/dynamic'

const ArticleStatsDisplay = nextDynamic(() => import('@/components/ArticleStatsDisplay'), { ssr: false })

// 启用 ISR，每 5 分钟重新验证
export const revalidate = 300

interface ArticlesPageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
    sort?: string
  }
}

interface Article {
  id: string
  title: string
  description: string
  content: string
  format: string[]
  category: string
  tags: string[]
  image: string | null
  views: number
  likes: number
  comments: number
  date: string
  url: string
  status: string
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const page = parseInt(searchParams.page || '1')
  const category = searchParams.category
  const tag = searchParams.tag
  const sort = searchParams.sort || 'newest'

  const articles = await getDatabase() as Article[]
  const categories = await getCategories()

  // 筛选文章
  let filteredArticles = articles

  if (category) {
    filteredArticles = filteredArticles.filter((article: Article) => article.category === category)
  }

  if (tag) {
    filteredArticles = filteredArticles.filter((article: Article) => article.tags.includes(tag))
  }

  // 排序文章
  if (sort === 'newest') {
    filteredArticles.sort((a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (sort === 'oldest') {
    filteredArticles.sort((a: Article, b: Article) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } else if (sort === 'popular') {
    filteredArticles.sort((a: Article, b: Article) => (b.views || 0) - (a.views || 0))
  }

  // 分页
  const itemsPerPage = siteConfig.pages.articles.itemsPerPage
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArticles = filteredArticles.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="max-w-none mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">所有资源</h1>
            <p className="text-gray-600">
              发现 {filteredArticles.length} 个优质资源
              {category && ` • 分类：${category}`}
              {tag && ` • 标签：${tag}`}
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
            {/* 分类筛选器 */}
            <div className="w-full lg:w-auto">
              <ConfigurableCategoryFilter
                categories={categories}
                currentCategory={category}
              />
            </div>

            {/* 排序选择器 */}
            <div className="w-full lg:w-auto">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">排序方式</h3>
              <SortSelector currentSort={sort} />
            </div>
          </div>

          {/* 当前筛选状态 */}
          {(category || tag) && (
            <div className="mb-6 flex items-center gap-4">
              <ClearFiltersButton />
            </div>
          )}

          <div className={`grid gap-6 ${siteConfig.pages.articles.grid.columns}`}>
            {currentArticles.length > 0 ? (
              currentArticles.map((article: Article) => (
                <Link key={article.id} href={generateArticleUrl(article.title, article.id)} prefetch={true}>
                  <Card className="bg-white/80 backdrop-blur-sm flex flex-col gap-0 py-0 px-0 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer overflow-hidden group border-0 rounded-xl">
                    <div className="relative overflow-hidden">
                      {article.image && (
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={800}
                          height={450}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          quality={75}
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
              <div className="col-span-full text-center py-12 text-gray-500">
                没有找到相关资源
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </main>
    </div>
  )
}
