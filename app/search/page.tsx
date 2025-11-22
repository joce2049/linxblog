"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Heart, MessageCircle, Calendar, Search, Filter, X } from "lucide-react"

import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import { generateArticleUrl } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import nextDynamic from 'next/dynamic'

const ArticleStatsDisplay = nextDynamic(() => import('@/components/ArticleStatsDisplay'), { ssr: false })

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
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; color: string }>>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '')
  const [selectedTag, setSelectedTag] = useState(searchParams.tag || '')
  const [sortBy, setSortBy] = useState(searchParams.sort || 'relevance')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    performSearch()
  }, [searchQuery, selectedCategory, selectedTag, sortBy, articles])

  const fetchData = async () => {
    try {
      // 添加缓存机制，避免重复请求
      const cacheKey = 'search_articles_cache'
      const cachedData = sessionStorage.getItem(cacheKey)

      if (cachedData) {
        const data = JSON.parse(cachedData)
        setArticles(data.articles || [])
        setCategories(data.categories || [])
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/articles', {
        // 添加缓存头
        headers: {
          'Cache-Control': 'max-age=300', // 5分钟缓存
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // 缓存数据到sessionStorage
      sessionStorage.setItem(cacheKey, JSON.stringify(data))

      setArticles(data.articles || [])
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // 如果API失败，尝试使用缓存数据
      const cachedData = sessionStorage.getItem('search_articles_cache')
      if (cachedData) {
        const data = JSON.parse(cachedData)
        setArticles(data.articles || [])
        setCategories(data.categories || [])
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
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'oldest':
        results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
      const url = new URL(window.location.href)
      url.searchParams.set('q', searchQuery.trim())
      if (selectedCategory) url.searchParams.set('category', selectedCategory)
      if (selectedTag) url.searchParams.set('tag', selectedTag)
      if (sortBy !== 'relevance') url.searchParams.set('sort', sortBy)
      window.history.pushState({}, '', url.toString())
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
    const url = new URL(window.location.href)
    url.searchParams.delete('category')
    url.searchParams.delete('tag')
    url.searchParams.delete('sort')
    window.history.pushState({}, '', url.toString())
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <ConfigurableNavigation categories={categories} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-none mx-auto">
          {/* Search Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">搜索资源</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {searchQuery ? `搜索 "${searchQuery}" 的结果` : '输入关键词，探索精选资源库'}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-md border-0 rounded-2xl mb-8 shadow-2xl shadow-blue-500/10">
            <div className="p-8">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                    <Input
                      placeholder="输入关键词搜索资源..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 h-14 text-lg bg-gray-50/80 border border-blue-200/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white focus:border-blue-400 text-gray-900 placeholder:text-gray-500 shadow-inner transition-all duration-300 font-medium"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="px-8 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white"
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
                    className="flex items-center space-x-2 bg-gray-50/80 border-0 rounded-xl px-4 py-2.5 text-gray-700 hover:bg-white hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 font-medium focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white"
                  >
                    <Filter className="w-4 h-4" />
                    <span>筛选选项</span>
                  </Button>

                  {(selectedCategory || selectedTag || sortBy !== 'relevance') && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl px-3 py-2 transition-all duration-200 font-medium"
                    >
                      <X className="w-4 h-4 mr-1" />
                      清除筛选
                    </Button>
                  )}
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">分类</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white focus:bg-white shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
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
                      <label className="block text-sm font-semibold text-gray-800 mb-3">标签</label>
                      <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white focus:bg-white shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
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
                      <label className="block text-sm font-semibold text-gray-800 mb-3">排序</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50/80 border-0 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-white focus:bg-white shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
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
              <h2 className="text-2xl font-bold text-gray-900">
                搜索结果
              </h2>

              {filteredArticles.length > 0 && (
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-medium">
                  找到 {filteredArticles.length} 个相关资源
                </div>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md border-0 rounded-2xl shadow-xl shadow-gray-500/10">
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">未找到相关资源</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {searchQuery ? `没有找到与 "${searchQuery}" 相关的资源` : '请输入搜索关键词'}
                  </p>
                  <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto">
                    <p className="text-sm font-semibold text-gray-700 mb-3">搜索建议：</p>
                    <ul className="text-sm text-gray-600 space-y-2 text-left">
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>尝试使用更简单的关键词</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>检查拼写是否正确</li>
                      <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>使用分类或标签筛选</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredArticles.map((article) => (
                  <Link key={article.id} href={generateArticleUrl(article.title, article.id)} prefetch={true}>
                    <Card className="bg-white/80 backdrop-blur-sm flex flex-col gap-0 py-0 px-0 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer overflow-hidden group border-0 rounded-xl">
                      <div className="relative overflow-hidden">
                        {article.image ? (
                          <Image
                            src={article.image}
                            alt={article.title}
                            width={800}
                            height={450}
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            quality={75}
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center text-gray-400">
                            无封面
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-white/90 text-gray-800">
                            {article.category}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-0">
                        <div className="p-5">
                          <h3
                            className="font-semibold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors leading-tight"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(article.title, searchQuery)
                            }}
                          />
                          <p
                            className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(article.description, searchQuery)
                            }}
                          />

                          {/* Tags - 显示所有标签 */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {article.tags.map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border-0 rounded-md"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>

                          {/* Stats - 使用真实的Supabase数据 */}
                          <ArticleStatsDisplay
                            articleId={article.id}
                            initialViews={0}
                            initialLikes={0}
                            comments={article.comments}
                          />

                          {/* Date */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{new Date(article.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
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
