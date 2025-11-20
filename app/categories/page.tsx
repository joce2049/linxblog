import { getDatabase, getCategories } from "@/lib/notion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Folder, ArrowRight, FileText, Calendar } from "lucide-react"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"
import Link from "next/link"

export default async function CategoriesPage() {
  const articles = await getDatabase()
  const categories = await getCategories()

  // 统计每个分类下的文章数量
  const categoryStats = categories.map(category => {
    const count = articles.filter(article => article.category === category.name).length
    const recentArticles = articles
      .filter(article => article.category === category.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
    
    return {
      ...category,
      count,
      recentArticles
    }
  }).sort((a, b) => b.count - a.count) // 按文章数量排序

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">资源分类</h1>
            <p className="text-gray-600">
              按类型浏览 {articles.length} 个优质资源，发现 {categories.length} 个专业分类
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryStats.map((category) => (
              <Card
                key={category.name}
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-0 rounded-xl overflow-hidden group"
              >
                <CardContent className="p-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.count} 个资源
                        </p>
                      </div>
                    </div>
                    
                    <Link href={`/articles?category=${encodeURIComponent(category.name)}`}>
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
                  {category.recentArticles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">最新资源</h4>
                      {category.recentArticles.map((article) => (
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
                    <Link href={`/articles?category=${encodeURIComponent(category.name)}`}>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        查看全部 {category.count} 个资源
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Overview */}
          <div className="mt-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">分类统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
                    <div className="text-sm text-gray-600">总分类数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">总资源数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(articles.length / categories.length)}
                    </div>
                    <div className="text-sm text-gray-600">平均每类资源</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {categoryStats[0]?.name || '-'}
                    </div>
                    <div className="text-sm text-gray-600">最热门分类</div>
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
