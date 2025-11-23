import { getDatabase, getCategories } from "@/lib/notion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Github,
  Twitter,
  Mail,
  Globe,
  Code,
  Database,
  Zap,
  Shield,
  Users,
  FileText,
  Heart,
  Search
} from "lucide-react"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import Link from "next/link"

// 强制动态渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AboutPage() {
  const articles = await getDatabase()
  const categories = await getCategories()

  const stats = {
    totalArticles: articles.length,
    totalCategories: categories.length,
    totalTags: new Set(articles.flatMap((article: any) => article.tags)).size,
    latestUpdate: new Date(Math.max(...articles.map((article: any) => new Date(article.date).getTime()))).toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-3xl">L</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">关于 LinX 后期工坊</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              基于 Notion 数据库构建的现代化知识分享平台
              <br />
              专注于优质内容收集与传播
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl text-center">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalArticles}</div>
                <div className="text-sm text-gray-600">总资源数</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl text-center">
              <CardContent className="p-6">
                <Database className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalCategories}</div>
                <div className="text-sm text-gray-600">分类数量</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl text-center">
              <CardContent className="p-6">
                <Code className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalTags}</div>
                <div className="text-sm text-gray-600">标签数量</div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl text-center">
              <CardContent className="p-6">
                <Zap className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{stats.latestUpdate}</div>
                <div className="text-sm text-gray-600">最新更新</div>
              </CardContent>
            </Card>
          </div>

          {/* Announcement */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                公告
              </h2>
              <div className="text-center space-y-4 text-gray-700 leading-relaxed">
                <p className="text-base">
                  所有分享仅供学习使用，请勿用于商业。
                </p>
                <p className="text-base">
                  教程、资源、影视素材持续更新，欢迎关注获取最新内容！
                </p>
                <p className="text-base pt-2">
                  网站域名可能会失效，我们的社交平台同步更新：
                </p>
                <p className="text-base font-medium">
                  公众号 / 小红书：
                  <a
                    href="https://www.xiaohongshu.com/user/profile/5f70aed20000000001002f89"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    LinX后期工坊
                  </a>
                  <span className="mx-3">•</span>
                  B站：
                  <a
                    href="https://space.bilibili.com/173981850"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    野生技术协会会长
                  </a>
                </p>
                <div className="pt-4 pb-2">
                  <p className="text-base font-semibold text-orange-600 flex items-center justify-center">
                    <span className="mr-2">⚠️</span>
                    下载前请务必先转存，避免资源失效！
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    （如需解压）密码：<span className="font-mono bg-gray-100 px-2 py-1 rounded">bzysjsxhhz</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">核心功能</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">智能搜索</h3>
                  <p className="text-sm text-gray-600">快速定位所需资源，支持关键词和标签搜索</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">分类管理</h3>
                  <p className="text-sm text-gray-600">专业的分类系统，便于资源整理和发现</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">数据安全</h3>
                  <p className="text-sm text-gray-600">基于 Notion 的安全数据存储和访问控制</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">联系我们</h2>
                <div className="space-y-3">
                  <a href="mailto:contact@linx.com" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                    <span>contact@linx.com</span>
                  </a>
                  <a href="https://github.com/linx" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                  </a>
                  <a href="https://twitter.com/linx" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">快速导航</h2>
                <div className="space-y-3">
                  <Link href="/articles" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <FileText className="w-5 h-5" />
                    <span>浏览所有资源</span>
                  </Link>
                  <Link href="/categories" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Database className="w-5 h-5" />
                    <span>查看分类</span>
                  </Link>
                  <Link href="/tags" className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                    <Code className="w-5 h-5" />
                    <span>浏览标签</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Made with love for the creative community</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 LinX 后期工坊. 基于 Next.js 和 Notion 构建.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
