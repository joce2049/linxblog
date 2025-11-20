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

export default async function AboutPage() {
  const articles = await getDatabase()
  const categories = await getCategories()

  const stats = {
    totalArticles: articles.length,
    totalCategories: categories.length,
    totalTags: new Set(articles.flatMap(article => article.tags)).size,
    latestUpdate: new Date(Math.max(...articles.map(article => new Date(article.date).getTime()))).toLocaleDateString('zh-CN')
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
              基于 Notion 数据库构建的现代化知识分享平台，专注于优质内容收集与传播
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

          {/* Project Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-600" />
                  项目特色
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>基于 Notion API 的动态数据获取</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>响应式设计，支持多设备访问</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>现代化 UI 设计，采用 Heo 主题风格</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>智能搜索和分类系统</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>高性能架构，基于 Next.js 14</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Code className="w-6 h-6 mr-2 text-green-600" />
                  技术栈
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">前端框架</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Next.js 14</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">UI 组件</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Radix UI</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">样式框架</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">Tailwind CSS</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">数据源</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">Notion API</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">开发语言</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">TypeScript</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
