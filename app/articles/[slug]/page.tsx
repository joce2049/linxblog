import { notFound } from "next/navigation"
import { getDatabase, getCategories } from "@/lib/notion"
import { getFullPageContent } from "@/lib/notion-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Eye, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import DynamicSEO from "@/components/DynamicSEO"
import StructuredData from "@/components/StructuredData"
import { generateArticleUrl } from "@/lib/utils"
import ArticleLikeActions from "@/components/ArticleLikeActions"

// 强制动态渲染，确保每次请求都获取最新的 Notion 图片 URL
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Article {
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
}

interface NotionContentResult {
  htmlContent: string
  blocks: any[]
  hasContent: boolean
  blockCount: number
  typeDistribution: Record<string, number>
  error?: string
}

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const [rawArticles, rawCategories] = await Promise.all([
    getDatabase(),
    getCategories()
  ])

  // Cast raw articles to our typed Article interface
  const articles = rawArticles as unknown as Article[]
  const categories = rawCategories || []

  // 查找文章：尝试多种匹配方式
  const decodedSlug = decodeURIComponent(params.slug)

  const article = articles.find((p) => {
    // 方式1: 如果 slug 是 ID (32位 hex 或 UUID)
    if (params.slug.match(/^[a-f0-9]{32}|[a-f0-9-]{36}$/i)) {
      return p.id.replace(/-/g, "") === params.slug.replace(/-/g, "")
    }

    // 方式2: 精确匹配标题 (处理 URL 编码)
    if (p.title === decodedSlug) {
      return true
    }

    // 方式3: 清理后的标题匹配（移除特殊字符）
    const cleanSlug = decodedSlug.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase()
    const cleanTitle = p.title.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase()

    if (cleanSlug === cleanTitle) {
      return true
    }

    // 方式4: 模糊匹配（标题包含slug或slug包含标题）
    if (cleanTitle.includes(cleanSlug) || cleanSlug.includes(cleanTitle)) {
      return true
    }

    return false
  })

  if (!article) {
    notFound()
  }

  // 获取文章内容 - 始终从 Notion blocks 获取
  const contentResult = await getFullPageContent(article.id) as NotionContentResult
  const htmlContent = contentResult.htmlContent || ''

  // 获取相关推荐文章（同分类或同标签）
  const relatedArticles = articles
    .filter(a =>
      a.id !== article.id && // 排除当前文章
      (a.category === article.category || // 同分类
        a.tags.some(tag => article.tags.includes(tag))) // 有共同标签
    )
    .slice(0, 4) // 只取前4篇

  return (
    <>
      <DynamicSEO
        title={article.title}
        description={article.description}
        keywords={article.tags}
        image={article.image || undefined}
      />
      <StructuredData
        type="article"
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": article.title,
          "description": article.description,
          "image": article.image || undefined,
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
          "datePublished": article.date,
          "dateModified": article.date
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* 导航栏 */}
        <ConfigurableNavigation categories={categories} />

        {/* 文章头部 - 带封面图的大图样式，添加高斯模糊背景 */}
        {article.image && (
          <div className="relative w-full h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
            {/* 高斯模糊背景层 */}
            <div className="absolute inset-0">
              <UnifiedImage
                src={article.image}
                alt=""
                className="w-full h-full object-cover"
                style={{ filter: 'blur(10px)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
            </div>

            {/* 文章标题覆盖在底部 */}
            <div className="relative h-full flex flex-col justify-end">
              <div className="container max-w-6xl mx-auto px-4 pb-12">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                      {article.category}
                    </Badge>
                    {article.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white drop-shadow-2xl leading-tight">
                    {article.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.date).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {article.views} 阅读
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      {article.likes} 点赞
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {article.comments} 评论
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 无封面图的简洁头部 */}
        {!article.image && (
          <div className="bg-white border-b">
            <div className="container max-w-6xl mx-auto px-4 py-12">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                    {article.category}
                  </Badge>
                  {article.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold text-gray-900">
                  {article.title}
                </h1>

                <p className="text-lg text-gray-600">{article.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.date).toLocaleDateString('zh-CN')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {article.views} 阅读
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {article.likes} 点赞
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 文章内容主体 - 宽屏显示 */}
        <main className="container max-w-6xl mx-auto px-4 py-8 lg:py-12">
          {/* 文章内容 */}
          <article className="bg-white rounded-2xl shadow-md p-6 md:p-10 lg:p-14 mb-12">
            {/* 文章属性信息 */}
            <div className="mb-12 pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 资源信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 期数 */}
                {article.description && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">期数</div>
                    <div className="flex-1 text-gray-900 font-medium">{article.description}</div>
                  </div>
                )}

                {/* 标签 */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">标签</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 格式 */}
                {article.format && article.format.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">格式</div>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {article.format.map((fmt) => (
                        <Badge key={fmt} className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">
                          {fmt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 网盘链接 */}
                {article.url && article.url !== '#' && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-500">网盘1</div>
                    <div className="flex-1">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {article.url}
                      </a>
                    </div>
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
                  <div class="text-center py-16 text-gray-500">
                    <p class="text-xl mb-3 font-medium">📝 暂无文章内容</p>
                    <p class="text-base">${article.description || '该文章还没有添加内容'}</p>
                  </div>
                `
              }}
            />

            {/* 文章底部操作栏 */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <ArticleLikeActions articleId={article.id} initialComments={article.comments} />
            </div>
          </article>

          {/* 相关推荐 */}
          {relatedArticles.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">相关推荐</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.id}
                    href={generateArticleUrl(relatedArticle.title, relatedArticle.id)}
                  >
                    <Card className="bg-white hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-0 rounded-xl h-full">
                      {relatedArticle.image && (
                        <div className="relative overflow-hidden aspect-video">
                          <UnifiedImage
                            src={relatedArticle.image}
                            alt={relatedArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-base mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                          {relatedArticle.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {relatedArticle.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {relatedArticle.views}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {relatedArticle.category}
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
