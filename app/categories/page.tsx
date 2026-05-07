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
  const categoryStats = categories.map((category: any) => {
    const count = articles.filter((article: any) => article.category === category.name).length
    const recentArticles = articles
      .filter((article: any) => article.category === category.name)
      .sort((a: any, b: any) => new Date(b.lastEditedTime || b.date).getTime() - new Date(a.lastEditedTime || a.date).getTime())
      .slice(0, 3)

    return {
      ...category,
      count,
      recentArticles
    }
  }).sort((a: any, b: any) => b.count - a.count) // 按文章数量排序

  return (
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">资源分类</h1>
            <p className="text-muted-foreground">
              按类型浏览 {articles.length} 个优质资源，发现 {categories.length} 个专业分类
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryStats.map((category: any) => (
              <Card
                key={category.name}
                className="bg-card border border-border card-hover rounded-xl overflow-hidden group"
              >
                <CardContent className="p-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="brand-logo-mark w-12 h-12 rounded-lg flex items-center justify-center">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
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
                      <h4 className="text-sm font-medium text-foreground/80">最新资源</h4>
                      {category.recentArticles.map((article: any) => (
                        <div
                          key={article.id}
                          className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg hover:bg-accent transition-colors group/item"
                        >
                          <div className="w-8 h-8 bg-primary/15 rounded-md flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-foreground truncate group-hover/item:text-primary transition-colors">
                              {article.title}
                            </h5>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(article.date).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View All Button */}
                  <div className="mt-4 pt-4">
                    <Link href={`/articles?category=${encodeURIComponent(category.name)}`}>
                      <Button
                        variant="outline"
                        className="w-full border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"
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
            <Card className="bg-card border border-border rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">分类统计</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{categories.length}</div>
                    <div className="text-sm text-muted-foreground">总分类数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{articles.length}</div>
                    <div className="text-sm text-muted-foreground">总资源数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(articles.length / categories.length)}
                    </div>
                    <div className="text-sm text-muted-foreground">平均每类资源</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {categoryStats[0]?.name || '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">最热门分类</div>
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
