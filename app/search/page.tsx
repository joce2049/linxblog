"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Heart, MessageCircle, Calendar, Search, Filter, X, Sparkles } from "lucide-react"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import { generateArticleUrl } from "@/lib/utils"
import Link from "next/link"
import UnifiedImage from "@/components/UnifiedImage"
import nextDynamic from 'next/dynamic'

const ArticleStatsDisplay = nextDynamic(() => import('@/components/ArticleStatsDisplay'), { ssr: false })
const SEARCH_CACHE_KEY = 'search_articles_cache_v2'
const SEARCH_CACHE_TTL = 5 * 60 * 1000

interface Article {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  image: string
  views: number
  likes: number
  comments: number
  date: string
  lastEditedTime?: string
  url: string
  status: string
}

interface SearchPageProps {
  searchParams: {
    q?: string
    category?: string
    tag?: string
    sort?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; color: string }>>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '')
  const [selectedTag, setSelectedTag] = useState(searchParams.tag || '')
  const [sortBy, setSortBy] = useState(searchParams.sort || 'relevance')

  // 计算随机推荐文章（使用 useMemo 避免重新计算）
  const randomRecommendations = useMemo(() => {
    if (articles.length === 0) return []

    // 随机打乱数组
    const shuffled = [...articles].sort(() => Math.random() - 0.5)

    // PC: 10个, 平板: 8个, 手机: 6个
    const limit = typeof window !== 'undefined'
      ? window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 8 : 6
      : 10

    return shuffled.slice(0, limit)
  }, [articles])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    performSearch()
  }, [searchQuery, selectedCategory, selectedTag, sortBy, articles])

  const fetchData = async () => {
    const readCachedData = (allowExpired = false) => {
      try {
        const cachedData = sessionStorage.getItem(SEARCH_CACHE_KEY)
        if (!cachedData) return null

        const data = JSON.parse(cachedData)
        const isFresh = typeof data.expiresAt === 'number' && data.expiresAt > Date.now()

        if (!allowExpired && !isFresh) {
          sessionStorage.removeItem(SEARCH_CACHE_KEY)
          return null
        }

        return data
      } catch {
        sessionStorage.removeItem(SEARCH_CACHE_KEY)
        return null
      }
    }

    try {
      // 清理旧缓存，避免继续使用已经过期的 Notion 图片签名链接
      sessionStorage.removeItem('search_articles_cache')

      const cachedData = readCachedData()
      if (cachedData) {
        setArticles(cachedData.articles || [])
        setCategories(cachedData.categories || [])
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/articles', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Notion 文件链接有效期较短，只短暂缓存数据，避免图片 URL 过期后仍被复用
      sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify({
        ...data,
        expiresAt: Date.now() + SEARCH_CACHE_TTL,
      }))

      setArticles(data.articles || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // 如果 API 临时失败，才退回到当前版本缓存
      const cachedData = readCachedData(true)
      if (cachedData) {
        setArticles(cachedData.articles || [])
        setCategories(cachedData.categories || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const performSearch = () => {
    if (!articles.length) return

    let results = articles

    // 关键词搜索 - 优化搜索算法
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const queryWords = query.split(/\s+/).filter(word => word.length > 0)

      results = results.filter(article => {
        const title = article.title.toLowerCase()
        const description = article.description.toLowerCase()
        const category = article.category.toLowerCase()
        const tags = article.tags.map(tag => tag.toLowerCase())

        // 计算匹配分数
        let score = 0

        queryWords.forEach(word => {
          // 标题匹配权重最高
          if (title.includes(word)) score += 10
          // 分类匹配权重次之
          if (category.includes(word)) score += 8
          // 标签匹配权重再次
          if (tags.some(tag => tag.includes(word))) score += 6
          // 描述匹配权重最低
          if (description.includes(word)) score += 4
        })

        return score > 0
      })

      // 按匹配分数排序
      results.sort((a, b) => {
        const aScore = calculateSearchScore(a, queryWords)
        const bScore = calculateSearchScore(b, queryWords)
        return bScore - aScore
      })
    }

    // 分类筛选
    if (selectedCategory) {
      results = results.filter(article => article.category === selectedCategory)
    }

    // 标签筛选
    if (selectedTag) {
      results = results.filter(article => article.tags.includes(selectedTag))
    }

    // 排序
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.lastEditedTime || b.date).getTime() - new Date(a.lastEditedTime || a.date).getTime())
        break
      case 'oldest':
        results.sort((a, b) => new Date(a.lastEditedTime || a.date).getTime() - new Date(b.lastEditedTime || b.date).getTime())
        break
      case 'popular':
        results.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'relevance':
      default:
        // 保持搜索相关性排序
        break
    }

    setFilteredArticles(results)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      if (selectedCategory) params.set('category', selectedCategory)
      if (selectedTag) params.set('tag', selectedTag)
      if (sortBy !== 'relevance') params.set('sort', sortBy)
      router.replace(`/search?${params.toString()}`, { scroll: false })
    }
  }

  // 计算搜索分数
  const calculateSearchScore = (article: Article, queryWords: string[]) => {
    const title = article.title.toLowerCase()
    const description = article.description.toLowerCase()
    const category = article.category.toLowerCase()
    const tags = article.tags.map(tag => tag.toLowerCase())

    let score = 0

    queryWords.forEach(word => {
      // 标题匹配权重最高
      if (title.includes(word)) score += 10
      // 分类匹配权重次之
      if (category.includes(word)) score += 8
      // 标签匹配权重再次
      if (tags.some(tag => tag.includes(word))) score += 6
      // 描述匹配权重最低
      if (description.includes(word)) score += 4
    })

    return score
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedTag('')
    setSortBy('relevance')
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    const qs = params.toString()
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false })
  }

  // 判断是否有搜索或筛选条件
  const hasSearchOrFilter = searchQuery.trim() || selectedCategory || selectedTag || sortBy !== 'relevance'

  // 显示的文章列表：如果有搜索/筛选则显示结果，否则显示随机推荐
  const displayArticles = hasSearchOrFilter ? filteredArticles : randomRecommendations

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ConfigurableNavigation categories={categories} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-none mx-auto">
          {/* Search Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">搜索资源</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {searchQuery ? `搜索 "${searchQuery}" 的结果` : '输入关键词，探索精选资源库'}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-card/90 backdrop-blur-md border-0 rounded-2xl mb-8">
            <div className="p-8">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                    <Input
                      placeholder="输入关键词搜索资源..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 h-14 text-lg bg-muted/50 border border-border rounded-2xl focus:bg-white focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background focus:border-primary/60 text-foreground placeholder:text-muted-foreground shadow-inner transition-all duration-300 font-medium"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 h-14 gradient-bg hover:opacity-90 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                  >
                    搜索
                  </Button>
                </div>

                {/* Filters Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-muted/50 border-0 rounded-xl px-4 py-2.5 text-foreground/80 hover:bg-card hover:text-foreground transition-all duration-200 font-medium focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Filter className="w-4 h-4" />
                    <span>筛选选项</span>
                  </Button>

                  {(selectedCategory || selectedTag || sortBy !== 'relevance') && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 transition-all duration-200 font-medium"
                    >
                      <X className="w-4 h-4 mr-1" />
                      清除筛选
                    </Button>
                  )}
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-border/60">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">分类</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/50 border-0 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background focus:bg-card transition-all duration-200 font-medium cursor-pointer"
                      >
                        <option value="">全部分类</option>
                        {categories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">标签</label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/50 border-0 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-background focus:bg-card transition-all duration-200 font-medium cursor-pointer"
                      >
                        <option value="">全部标签</option>
                        {Array.from(new Set(articles.flatMap(article => article.tags))).map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-3">排序</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-muted/50 border-0 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-background focus:bg-card transition-all duration-200 font-medium cursor-pointer"
                      >
                        <option value="relevance">相关性</option>
                        <option value="newest">最新</option>
                        <option value="oldest">最旧</option>
                        <option value="popular">最热</option>
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {!hasSearchOrFilter && <Sparkles className="w-6 h-6 text-primary" />}
                {hasSearchOrFilter ? '搜索结果' : '推荐'}
              </h2>

              {displayArticles.length > 0 && (
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-medium">
                  {hasSearchOrFilter ? `找到 ${filteredArticles.length} 个相关资源` : `为您推荐 ${randomRecommendations.length} 个精选资源`}
                </div>
              )}
            </div>

            {displayArticles.length === 0 ? (
              <div className="bg-card/90 backdrop-blur-md border-0 rounded-2xl shadow-gray-500/10">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground/70" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">未找到相关资源</h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    {searchQuery ? `没有找到与 "${searchQuery}" 相关的资源` : '请输入搜索关键词'}
                  </p>
                  <div className="bg-muted/50 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-sm font-semibold text-foreground/80 mb-3">搜索建议：</p>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary/60 rounded-full mr-3"></span>尝试使用更简单的关键词</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary/60 rounded-full mr-3"></span>检查拼写是否正确</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-primary/60 rounded-full mr-3"></span>使用分类或标签筛选</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {displayArticles.map((article) => (
                  <Link key={article.id} href={generateArticleUrl(article.title, article.id)} prefetch={true}>
                    <Card className="bg-card border border-border card-hover flex flex-col gap-0 py-0 px-0 cursor-pointer overflow-hidden group rounded-xl">
                      <div className="relative overflow-hidden">
                        {article.image && (
                          <UnifiedImage
                            src={article.image}
                            alt={article.title}
                            pageId={article.id}
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-0">
                        <div className="p-5">
                          <h3
                            className="font-semibold text-lg mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(article.title, searchQuery)
                            }}
                          />
                          <p
                            className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(article.description, searchQuery)
                            }}
                          />

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {article.tags.map((t) => (
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
                            articleId={article.id}
                            initialViews={0}
                            initialLikes={0}
                            comments={article.comments}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
