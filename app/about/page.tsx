import { getDatabase, getCategories } from "@/lib/notion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Globe,
  Code,
  Database,
  Zap,
  Shield,
  Users,
  FileText,
  Search
} from "lucide-react"
import { BilibiliIcon, XiaohongshuIcon } from "@/components/SocialIcons"
import ConfigurableNavigation from "@/components/ConfigurableNavigation"
import Link from "next/link"
import { siteConfig } from "@/config/site"

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
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="brand-logo-mark w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="font-bold text-3xl">L</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">关于 {siteConfig.brand.name}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {siteConfig.brand.slogan}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card border border-border rounded-xl text-center">
              <CardContent className="p-6">
                <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">{stats.totalArticles}</div>
                <div className="text-sm text-muted-foreground">总资源数</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl text-center">
              <CardContent className="p-6">
                <Database className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">{stats.totalCategories}</div>
                <div className="text-sm text-muted-foreground">分类数量</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl text-center">
              <CardContent className="p-6">
                <Code className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">{stats.totalTags}</div>
                <div className="text-sm text-muted-foreground">标签数量</div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl text-center">
              <CardContent className="p-6">
                <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-foreground">{stats.latestUpdate}</div>
                <div className="text-sm text-muted-foreground">最新更新</div>
              </CardContent>
            </Card>
          </div>

          {/* Announcement */}
          <Card className="bg-card border border-border rounded-xl mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center">
                <Globe className="w-6 h-6 mr-2 text-primary" />
                公告
              </h2>
              <div className="text-center space-y-4 text-foreground/80 leading-relaxed">
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
                    href={siteConfig.social.platforms.xiaohongshu.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary hover:underline transition-colors"
                  >
                    LinX后期工坊
                  </a>
                  <span className="mx-3">•</span>
                  B站：
                  <a
                    href={siteConfig.social.platforms.bilibili.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary hover:underline transition-colors"
                  >
                    野生技术协会会长
                  </a>
                </p>
                <div className="pt-4 pb-2">
                  <p className="text-base font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <span className="mr-2">⚠️</span>
                    下载前请务必先转存，避免资源失效！
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    （如需解压）密码：<span className="font-mono bg-muted px-2 py-1 rounded">bzysjsxhhz</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="bg-card border border-border rounded-xl mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">核心功能</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">智能搜索</h3>
                  <p className="text-sm text-muted-foreground">快速定位所需资源，支持关键词和标签搜索</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">分类管理</h3>
                  <p className="text-sm text-muted-foreground">专业的分类系统，便于资源整理和发现</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">数据安全</h3>
                  <p className="text-sm text-muted-foreground">基于 Notion 的安全数据存储和访问控制</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card border border-border rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">联系我们</h2>
                <div className="space-y-3">
                  <a href={`mailto:${siteConfig.social.email}`} className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                    <span>{siteConfig.social.email}</span>
                  </a>
                  <a href={siteConfig.social.platforms.bilibili.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors">
                    <BilibiliIcon className="w-5 h-5" />
                    <span>哔哩哔哩</span>
                  </a>
                  <a href={siteConfig.social.platforms.xiaohongshu.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-foreground/80 hover:text-pink-600 transition-colors">
                    <XiaohongshuIcon className="w-5 h-5" />
                    <span>小红书</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">快速导航</h2>
                <div className="space-y-3">
                  <Link href="/articles" className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors">
                    <FileText className="w-5 h-5" />
                    <span>浏览所有资源</span>
                  </Link>
                  <Link href="/categories" className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors">
                    <Database className="w-5 h-5" />
                    <span>查看分类</span>
                  </Link>
                  <Link href="/tags" className="flex items-center space-x-3 text-foreground/80 hover:text-primary transition-colors">
                    <Code className="w-5 h-5" />
                    <span>浏览标签</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
