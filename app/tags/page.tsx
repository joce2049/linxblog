import { getDatabase, getTags, getCategories } from "@/lib/notion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, ArrowRight, FileText, Calendar, TrendingUp } from "lucide-react"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import Link from "next/link"

export default async function TagsPage() {
  const articles = await getDatabase()
  const tags = await getTags()
  const categories = await getCategories()

  // 统计每个标签下的文章数量和最近文章
  const tagStats = tags.map(tag => {
    const count = articles.filter(article => article.tags.includes(tag.name)).length
    const recentArticles = articles
      .filter(article => article.tags.includes(tag.name))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
    
    return {
      ...tag,
      count,
      recentArticles
    }
  }).sort((a, b) => b.count - a.count) // 按文章数量排序

  // 计算标签云数据
  const maxCount = Math.max(...tagStats.map(tag => tag.count))
  const minCount = Math.min(...tagStats.map(tag => tag.count))
  
  const getTagSize = (count: number) => {
    if (count === maxCount) return 'text-2xl font-bold'
    if (count >= maxCount * 0.7) return 'text-xl font-semibold'
    if (count >= maxCount * 0.4) return 'text-lg font-medium'
    if (count >= maxCount * 0.2) return 'text-base'
    return 'text-sm'
  }

  const getTagColor = (count: number) => {
    if (count === maxCount) return 'text-blue-600 bg-blue-100'
    if (count >= maxCount * 0.7) return 'text-purple-600 bg-purple-100'
    if (count >= maxCount * 0.4) return 'text-green-600 bg-green-100'
    if (count >= maxCount * 0.2) return 'text-orange-600 bg-orange-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">资源标签</h1>
            <p className="text-gray-600">
              通过 {tags.length} 个专业标签，精准定位 {articles.length} 个优质资源
            </p>
          </div>

          {/* Tag Cloud */}
          <div className="mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  标签云
                </h3>
                <div className="flex flex-wrap gap-3">
                  {tagStats.map((tag) => (
                    <Link
                      key={tag.name}
                      href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                      className="group"
                    >
                      <Badge
                        variant="secondary"
                        className={`${getTagSize(tag.count)} ${getTagColor(tag.count)} px-3 py-2 hover:scale-105 transition-all duration-200 cursor-pointer group-hover:shadow-md`}
                      >
                        {tag.name}
                        <span className="ml-2 text-xs opacity-75">({tag.count})</span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Tags */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              热门标签
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tagStats.slice(0, 9).map((tag) => (
                <Card
                  key={tag.name}
                  className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-0 rounded-xl overflow-hidden group"
                >
                  <CardContent className="p-6">
                    {/* Tag Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Tag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {tag.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {tag.count} 个资源
                          </p>
                        </div>
                      </div>
                      
                      <Link href={`/articles?tag=${encodeURIComponent(tag.name)}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    {/* Recent Articles */}
                    {tag.recentArticles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">相关资源</h4>
                        {tag.recentArticles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group/item"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate group-hover/item:text-blue-600 transition-colors">
                                {article.title}
                              </h5>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(article.date).toLocaleDateString('zh-CN')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View All Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link href={`/articles?tag=${encodeURIComponent(tag.name)}`}>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        >
                          查看全部 {tag.count} 个资源
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Tags */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">所有标签</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tagStats.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                  className="group"
                >
                  <Card className="bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 border-0 rounded-lg overflow-hidden">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors">
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {tag.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{tag.count}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Tag Statistics */}
          <div className="mt-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">标签统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{tags.length}</div>
                    <div className="text-sm text-gray-600">总标签数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">总资源数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(articles.length / tags.length)}
                    </div>
                    <div className="text-sm text-gray-600">平均每标签资源</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {tagStats[0]?.name || '-'}
                    </div>
                    <div className="text-sm text-gray-600">最热门标签</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
