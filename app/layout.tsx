import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundary from '@/components/ErrorBoundary'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import ContentProtection from '@/components/ContentProtection'
import BackToTop from '@/components/BackToTop'
import SiteFooter from '@/components/SiteFooter'
import ThemeStyleInjector from '@/components/ThemeStyleInjector'
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F19' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <ThemeStyleInjector />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.notion.com" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* 阅读进度条 */}
            <ReadingProgressBar />

            {/* 内容防复制保护 */}
            <ContentProtection />

            {/* 主要内容 */}
            {children}

            {/* 全站 footer */}
            <SiteFooter />

            {/* 返回顶部按钮 */}
            <BackToTop />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
