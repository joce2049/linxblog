import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getResourcesDatabase, getResourcesCategories } from "@/lib/notion"
import { getFullPageContent } from "@/lib/notion-content"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"
import { coverSrc } from "@/lib/media-url"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import StructuredData from "@/components/StructuredData"
import { generateResourceUrl } from "@/lib/utils"
import nextDynamic from 'next/dynamic'

// 动态导入非关键组件
const ArticleLikeActions = nextDynamic(() => import('@/components/ArticleLikeActions'), { ssr: false })
const ArticleHeaderStats = nextDynamic(() => import('@/components/ArticleHeaderStats'), { ssr: false })
const ArticleStatsDisplay = nextDynamic(() => import('@/components/ArticleStatsDisplay'), { ssr: false })

// 强制动态渲染，确保每次请求都获取最新的 Notion 图片 URL
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Resource {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  format: string[]
  image: string | null
  views: number
  likes: number
  comments: number
  date: string
  url: string
  status: string
  content?: string
  extractCode?: string
}

interface NotionContentResult {
  htmlContent: string
  blocks: any[]
  hasContent: boolean
  blockCount: number
  typeDistribution: Record<string, number>
  error?: string
}

interface ResourcePageProps {
  params: {
    slug: string
  }
}

// 通过 slug 查找资源：UUID/32hex → 精确标题 → 清理后标题（与文章查找逻辑一致）
function findResourceBySlug(resources: Resource[], slug: string): Resource | undefined {
  const decoded = decodeURIComponent(slug)
  return resources.find((p) => {
    if (slug.match(/^([a-f0-9]{32}|[a-f0-9-]{36})$/i)) {
      return p.id.replace(/-/g, '') === slug.replace(/-/g, '')
    }
    if (p.title === decoded) return true
    const re = /[^a-z0-9一-龥]/gi
    const cleanSlug = decoded.replace(re, '').toLowerCase()
    const cleanTitle = p.title.replace(re, '').toLowerCase()
    return cleanSlug === cleanTitle
  })
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const resources = (await getResourcesDatabase()) as unknown as Resource[]
  const resource = findResourceBySlug(resources, params.slug)
  if (!resource) return {}

  const ogImages = resource.image ? [{ url: resource.image }] : undefined
  return {
    title: resource.title,
    description: resource.description,
    keywords: resource.tags,
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: 'article',
      images: ogImages,
      publishedTime: resource.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: resource.title,
      description: resource.description,
      images: resource.image ? [resource.image] : undefined,
    },
  }
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const [rawResources, rawCategories] = await Promise.all([
    getResourcesDatabase(),
    getResourcesCategories()
  ])

  const resources = rawResources as unknown as Resource[]
  const categories = rawCategories || []

  const resource = findResourceBySlug(resources, params.slug)

  if (!resource) {
    notFound()
  }

  // 获取资源详情内容 - 始终从 Notion blocks 获取（getFullPageContent 按 page id 工作，与文章共用）
  const contentResult = await getFullPageContent(resource.id) as NotionContentResult
  const htmlContent = contentResult.htmlContent || ''

  // 获取相关推荐（同分类或同标签，仅在学习资源库内查找）
  const relatedResources = resources
    .filter(r =>
      r.id !== resource.id &&
      (r.category === resource.category ||
        r.tags.some(tag => resource.tags.includes(tag)))
    )
    .slice(0, 4)

  return (
    <>
      <StructuredData
        type="article"
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": resource.title,
          "description": resource.description,
          "image": resource.image || undefined,
          "author": {
            "@type": "Person",
            "name": "LinX Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "LinX Team",
            "logo": {
              "@type": "ImageObject",
              "url": "/placeholder-logo.svg"
            }
          },
          "datePublished": resource.date,
          "dateModified": resource.date
        }}
      />

      <div className="min-h-screen bg-background">
        {/* 导航栏 */}
        <ConfigurableNavigation categories={categories} />

        {/* 资源头部 - 带封面图的大图样式，添加高斯模糊背景 */}
        {resource.image && (
          <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
            {/* 高斯模糊背景层 */}
            <div className="absolute inset-0">
              <UnifiedImage
                src={coverSrc(resource.image, resource.id, resource.lastEditedTime)}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: 'blur(10px)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            </div>

            {/* 资源标题覆盖在底部 */}
            <div className="relative h-full flex flex-col justify-end">
              <div className="container max-w-6xl mx-auto px-4 pb-12">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary hover:bg-primary/90 text-white border-0">
                      {resource.category}
                    </Badge>
                    {resource.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white drop-shadow-2xl leading-tight">
                    {resource.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(resource.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <ArticleHeaderStats
                      articleId={resource.id}
                      comments={resource.comments}
                      className="contents"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 无封面图的简洁头部 */}
        {!resource.image && (
          <div className="bg-card">
            <div className="container max-w-6xl mx-auto px-4 py-12">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary hover:bg-primary/90 text-white border-0">
                    {resource.category}
                  </Badge>
                  {resource.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-foreground">
                  {resource.title}
                </h1>

                <p className="text-lg text-muted-foreground">{resource.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(resource.date).toLocaleDateString('zh-CN')}
                  </div>
                  <ArticleHeaderStats
                    articleId={resource.id}
                    comments={resource.comments}
                    className="contents"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 资源内容主体 - 宽屏显示 */}
        <main className="container max-w-6xl mx-auto px-4 py-8 lg:py-12">
          {/* 内容 */}
          <article className="copy-protected bg-card border border-border rounded-2xl p-6 md:p-10 lg:p-14 mb-12">
            {/* 资源属性信息 */}
            <div className="mb-12 pb-8 border-b border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">📋 资源信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 期数 */}
                {resource.description && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">期数</div>
                    <div className="flex-1 text-foreground font-medium">{resource.description}</div>
                  </div>
                )}

                {/* 标签 */}
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">标签</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 格式 */}
                {resource.format && resource.format.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">格式</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {resource.format.map((fmt) => (
                        <Badge key={fmt} className="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border-0">
                          {fmt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 网盘链接 */}
                {resource.url && resource.url !== '#' && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">网盘</div>
                    <div className="flex-1">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 underline break-all"
                      >
                        {resource.url}
                      </a>
                    </div>
                  </div>
                )}

                {/* 提取码 */}
                {resource.extractCode && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-muted-foreground">提取码</div>
                    <div data-copy-allow className="flex-1 text-foreground font-medium font-mono tracking-wider">{resource.extractCode}</div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="article-content
                [&>*]:max-w-none
                [&_h1]:scroll-mt-20
                [&_h2]:scroll-mt-20
                [&_h3]:scroll-mt-20
                [&_a]:transition-colors
                [&_a]:break-words
                [&_a]:overflow-wrap-anywhere
                [&_img]:max-w-full
                [&_img]:h-auto
                [&_pre]:font-mono
                [&_code]:font-mono
                [&_figure]:mx-auto
                [&_blockquote]:my-8
                [&_ul]:my-6
                [&_ol]:my-6
              "
              dangerouslySetInnerHTML={{
                __html: htmlContent || `
                  <div class="text-center py-16 text-muted-foreground">
                    <p class="text-xl mb-3 font-medium">📝 暂无内容</p>
                    <p class="text-base">${resource.description || '该资源还没有添加内容'}</p>
                  </div>
                `
              }}
            />

            {/* 底部操作栏 */}
            <div className="mt-12 pt-8">
              <ArticleLikeActions articleId={resource.id} initialComments={resource.comments} />
            </div>
          </article>

          {/* 相关推荐 */}
          {relatedResources.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6">相关推荐</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedResources.map((relatedResource) => (
                  <Link
                    key={relatedResource.id}
                    href={generateResourceUrl(relatedResource.title, relatedResource.id)}
                    prefetch={true}
                  >
                    <Card className="bg-card border border-border card-hover transition-all duration-200 cursor-pointer overflow-hidden group rounded-xl h-full">
                      {relatedResource.image && (
                        <div className="relative overflow-hidden aspect-video">
                          <UnifiedImage
                            src={coverSrc(relatedResource.image, relatedResource.id, relatedResource.lastEditedTime)}
                            alt={relatedResource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight">
                          {relatedResource.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed">
                          {relatedResource.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <ArticleStatsDisplay
                            articleId={relatedResource.id}
                            initialViews={0}
                            initialLikes={0}
                            comments={0}
                          />
                          <Badge variant="secondary" className="text-xs">
                            {relatedResource.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
