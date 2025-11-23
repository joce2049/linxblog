import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import BackToTop from '@/components/BackToTop'

// 配置字体
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Lindx Blog - 资源分享与技术交流',
    template: '%s | Lindx Blog'
  },
  description: '分享优质的设计资源、开发工具、学习资料，助力创作者和开发者提升技能',
  keywords: [
    '设计资源',
    '开发工具',
    '学习资料',
    '前端开发',
    'UI设计',
    '技术博客',
    '资源分享'
  ],
  authors: [{ name: 'Lindx' }],
  creator: 'Lindx',
  publisher: 'Lindx Blog',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://lindx-blog.vercel.app',
    siteName: 'Lindx Blog',
    title: 'Lindx Blog - 资源分享与技术交流',
    description: '分享优质的设计资源、开发工具、学习资料，助力创作者和开发者提升技能',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Lindx Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lindx Blog - 资源分享与技术交流',
    description: '分享优质的设计资源、开发工具、学习资料，助力创作者和开发者提升技能',
    images: ['/og-image.jpg'],
    creator: '@lindx',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://lindx-blog.vercel.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.notion.com" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 阅读进度条 */}
            <ReadingProgressBar />

            {/* 主要内容 */}
            {children}

            {/* 返回顶部按钮 */}
            <BackToTop />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
