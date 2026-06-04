import { getResourcesDatabase } from "@/lib/notion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import SortSelector from "@/components/SortSelector"
import ResourceCategoryFilter from "@/components/ResourceCategoryFilter"
import Pagination from "@/components/Pagination"
import ClearFiltersButton from "@/components/ClearFiltersButton"
import { generateResourceUrl } from "@/lib/utils"
import { siteConfig } from "@/config/site"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"
import nextDynamic from 'next/dynamic'

const ArticleStatsDisplay = nextDynamic(() => import('@/components/ArticleStatsDisplay'), { ssr: false })

// 启用 ISR，每 5 分钟重新验证
export const revalidate = 300

interface ResourcesPageProps {
  searchParams: {
    page?: string
    category?: string
    tag?: string
    sort?: string
  }
}

interface Resource {
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
  extractCode?: string
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const page = parseInt(searchParams.page || '1')
  const category = searchParams.category
  const tag = searchParams.tag
  const sort = searchParams.sort || 'newest'

  const resources = await getResourcesDatabase() as Resource[]

  // 从资源列表动态提取分类（独立于文章库的分类体系）
  const categorySet = new Set<string>()
  resources.forEach((r) => {
    if (r.category) categorySet.add(r.category)
  })
  const categories = Array.from(categorySet).map(name => ({ name, color: 'default' }))

  // 筛选资源
  let filteredResources = resources

  if (category) {
    filteredResources = filteredResources.filter((r: Resource) => r.category === category)
  }

  if (tag) {
    filteredResources = filteredResources.filter((r: Resource) => r.tags.includes(tag))
  }

  // popular 排序：SSR 阶段从 Supabase 批量拉真实浏览量，覆盖 Notion 评分字段
  // 与文章共用 article_stats 表（按 Notion page id 区分，全局唯一，不会冲突）
  if (sort === 'popular' && supabase) {
    const ids = filteredResources.map((r: Resource) => r.id)
    const { data: stats, error } = await supabase
      .from('article_stats')
      .select('article_id, views')
      .in('article_id', ids)

    if (error) {
      console.warn('⚠️ Failed to fetch article_stats for popular sort, falling back to Notion field:', error.message)
    } else if (stats) {
      const viewsMap = new Map<string, number>(stats.map((s: { article_id: string; views: number }) => [s.article_id, s.views]))
      filteredResources = filteredResources.map((r: Resource) => ({
        ...r,
        views: viewsMap.get(r.id) ?? 0,
      }))
    }
  }

  // 根据排序选项排序
  if (sort === 'newest') {
    filteredResources.sort((a: Resource, b: Resource) => new Date(b.lastEditedTime || b.date).getTime() - new Date(a.lastEditedTime || a.date).getTime())
  } else if (sort === 'oldest') {
    filteredResources.sort((a: Resource, b: Resource) => new Date(a.lastEditedTime || a.date).getTime() - new Date(b.lastEditedTime || b.date).getTime())
  } else if (sort === 'popular') {
    filteredResources.sort((a: Resource, b: Resource) => (b.views || 0) - (a.views || 0))
  }

  // 分页
  const itemsPerPage = siteConfig.pages.resources.itemsPerPage
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentResources = filteredResources.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="max-w-none mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{siteConfig.pages.resources.title}</h1>
            <p className="text-muted-foreground">
              {siteConfig.pages.resources.subtitle} • 共 {filteredResources.length} 个资源
              {category && ` • 分类：${category}`}
              {tag && ` • 标签：${tag}`}
            </p>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
            {/* 分类筛选器（资源库专属） */}
            <div className="w-full lg:w-auto">
              <ResourceCategoryFilter
                categories={categories}
                currentCategory={category}
              />
            </div>

            {/* 排序选择器 */}
            <div className="w-full lg:w-auto">
              <h3 className="text-sm font-semibold text-foreground mb-3">排序方式</h3>
              <SortSelector currentSort={sort} basePath="/resources" />
            </div>
          </div>

          {/* 当前筛选状态 */}
          {(category || tag) && (
            <div className="mb-6 flex items-center gap-4">
              <ClearFiltersButton basePath="/resources" />
            </div>
          )}

          <div className={`grid gap-6 ${siteConfig.pages.resources.grid.columns}`}>
            {currentResources.length > 0 ? (
              currentResources.map((resource: Resource) => (
                <Link key={resource.id} href={generateResourceUrl(resource.title, resource.id)} prefetch={true}>
                  <Card className="bg-card border border-border card-hover flex flex-col gap-0 py-0 px-0 cursor-pointer overflow-hidden group rounded-xl">
                    <div className="relative overflow-hidden">
                      {resource.image && (
                        <UnifiedImage
                          src={resource.image}
                          alt={resource.title}
                          className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-0">
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
                          {resource.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {resource.tags.map((t: string) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-xs px-2 py-1 bg-primary/10 text-primary border-0 rounded-md"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>

                        <ArticleStatsDisplay
                          articleId={resource.id}
                          initialViews={0}
                          initialLikes={0}
                          comments={resource.comments}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {resources.length === 0
                  ? '学习资源库暂未配置或暂无内容（请检查 NOTION_RESOURCES_DATABASE_ID 与集成授权）'
                  : '没有找到相关资源'}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination currentPage={page} totalPages={totalPages} basePath="/resources" />
        </div>
      </main>
    </div>
  )
}
