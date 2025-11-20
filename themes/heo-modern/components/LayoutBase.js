"use client"

import { useGlobal } from "@/lib/global"
import Head from "next/head"
import BLOG from "@/blog.config"
import CONFIG from "../config"
import { Style } from "../style"
import Header from "./Header"
import Footer from "./Footer"

/**
 * 基础布局组件
 * @param {*} props
 * @returns
 */
const LayoutBase = (props) => {
  const { children, meta = {}, siteInfo = {} } = props
  const { locale = {}, isDarkMode = false } = useGlobal() || {}

  const pageTitle = meta?.title || siteInfo?.title || BLOG?.TITLE || "Blog"
  const pageDescription = meta?.description || siteInfo?.description || BLOG?.DESCRIPTION || ""
  const pageKeywords = meta?.keywords || BLOG?.KEYWORDS || ""
  const pageImage = meta?.image || BLOG?.AVATAR || ""
  const siteFavicon = BLOG?.FAVICON || "/favicon.ico"
  const siteAuthor = BLOG?.AUTHOR || ""

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content={siteAuthor} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />

        {/* Favicon */}
        <link rel="icon" href={siteFavicon} />

        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Style />

      <div id="theme-heo-modern" className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
        <div className="heo-bg-gradient">
          {/* 顶部通知栏 */}
          {CONFIG?.NOTICE_BAR?.ENABLE && CONFIG?.NOTICE_BAR?.TEXT && (
            <div className="bg-blue-600 text-white text-center py-2 px-4">
              <a href={CONFIG.NOTICE_BAR.URL || "#"} className="text-sm hover:underline">
                {CONFIG.NOTICE_BAR.TEXT}
              </a>
            </div>
          )}

          {/* 头部导航 */}
          <Header {...props} />

          {/* 主要内容 */}
          <main className="relative z-10">{children}</main>

          {/* 页脚 */}
          <Footer {...props} />
        </div>
      </div>
    </>
  )
}

export default LayoutBase
