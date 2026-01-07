import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import BackToTop from '@/components/BackToTop'
import { siteConfig } from '@/config/site'

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
    default: siteConfig.seo.metadata.title,
    template: siteConfig.seo.metadata.titleTemplate
  },
  description: siteConfig.seo.metadata.description,
  keywords: siteConfig.seo.metadata.keywords,
  authors: [{ name: siteConfig.seo.metadata.author }],
  creator: siteConfig.seo.metadata.author,
  publisher: siteConfig.seo.metadata.siteName,
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
    locale: siteConfig.seo.metadata.locale,
    url: siteConfig.url,
    siteName: siteConfig.seo.metadata.siteName,
    title: siteConfig.seo.metadata.title,
    description: siteConfig.seo.metadata.description,
    images: [
      {
        url: siteConfig.seo.metadata.ogImage.url,
        width: siteConfig.seo.metadata.ogImage.width,
        height: siteConfig.seo.metadata.ogImage.height,
        alt: siteConfig.seo.metadata.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.metadata.title,
    description: siteConfig.seo.metadata.description,
    images: [siteConfig.seo.metadata.ogImage.url],
    creator: `@${siteConfig.seo.metadata.author}`,
  },
  verification: {
    google: siteConfig.seo.verification.google,
    // bing: siteConfig.seo.verification.bing,
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
