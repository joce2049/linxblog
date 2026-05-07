import Link from 'next/link'
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { siteConfig } from '@/config/site'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full bg-card/95 backdrop-blur-sm border border-border rounded-2xl">
        <CardContent className="p-12 text-center">
          {/* 404 图标 */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="brand-logo-mark w-32 h-32 rounded-full flex items-center justify-center animate-pulse">
                <FileQuestion className="w-16 h-16" />
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground font-bold text-2xl">
                404
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-4xl font-bold text-foreground mb-4">
            页面未找到
          </h1>

          {/* 描述 */}
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移动。
            <br />
            别担心，让我们帮您找到正确的路！
          </p>

          {/* 可能的原因 */}
          <div className="bg-muted/60 border border-border rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
            <h2 className="font-semibold text-foreground mb-3 flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              可能的原因：
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>网址拼写错误</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>页面已被删除或移动</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>链接已过期</span>
              </li>
            </ul>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="w-full sm:w-auto gradient-bg text-white hover:opacity-90 transition-all duration-300 border-0"
              >
                <Home className="w-5 h-5 mr-2" />
                返回首页
              </Button>
            </Link>

            <Link href="/articles">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-border hover:border-primary hover:bg-accent transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                浏览文章
              </Button>
            </Link>

            <Link href="/search">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-border hover:border-primary hover:bg-accent transition-all duration-300"
              >
                <Search className="w-5 h-5 mr-2" />
                搜索资源
              </Button>
            </Link>
          </div>

          {/* 底部信息 */}
          <div className="mt-12 pt-8">
            <p className="text-sm text-muted-foreground">
              需要帮助？请访问{' '}
              <Link
                href="/about"
                className="text-primary hover:underline font-medium"
              >
                关于页面
              </Link>
              {' '}或返回{' '}
              <Link
                href="/"
                className="text-primary hover:underline font-medium"
              >
                {siteConfig.brand.name}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
