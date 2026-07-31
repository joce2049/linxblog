import { getDatabase, getCategories } from "@/lib/notion"
import { supabase } from "@/lib/supabase"
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
import UnifiedImage from "@/components/UnifiedImage"
import { coverSrc } from "@/lib/media-url"
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
  lastEditedTime?: string
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

  // popular 排序：SSR 阶段从 Supabase 批量拉真实浏览量,覆盖 Notion 评分字段
  // 仅在 sort=popular 时调用,避免拖慢其他排序模式
  if (sort === 'popular' && supabase) {
    const ids = filteredArticles.map((a: Article) => a.id)
    const { data: stats, error } = await supabase
      .from('article_stats')
      .select('article_id, views')
      .in('article_id', ids)

    if (error) {
      console.warn('⚠️ Failed to fetch article_stats for popular sort, falling back to Notion field:', error.message)
    } else if (stats) {
      const viewsMap = new Map<string, number>(stats.map((s: { article_id: string; views: number }) => [s.article_id, s.views]))
      filteredArticles = filteredArticles.map((a: Article) => ({
        ...a,
        views: viewsMap.get(a.id) ?? 0,
      }))
    }
  }

  // 根据排序选项排序
  if (sort === 'newest') {
    filteredArticles.sort((a: Article, b: Article) => new Date(b.lastEditedTime || b.date).getTime() - new Date(a.lastEditedTime || a.date).getTime())
  } else if (sort === 'oldest') {
    filteredArticles.sort((a: Article, b: Article) => new Date(a.lastEditedTime || a.date).getTime() - new Date(b.lastEditedTime || b.date).getTime())
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
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="max-w-none mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">所有资源</h1>
            <p className="text-muted-foreground">
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
              <h3 className="text-sm font-semibold text-foreground mb-3">排序方式</h3>
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
                  <Card className="bg-card border border-border card-hover flex flex-col gap-0 py-0 px-0 cursor-pointer overflow-hidden group rounded-xl">
                    <div className="relative overflow-hidden">
                      {article.image && (
                        <UnifiedImage
                          src={coverSrc(article.image, article.id, article.lastEditedTime)}
                          alt={article.title}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-0">
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                          {article.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {article.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-2 py-1 bg-primary/10 text-primary border-0 rounded-md"
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
              <div className="col-span-full text-center py-12 text-muted-foreground">
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
