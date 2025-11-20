"use client"

/**
 * HEO Modern 主题
 * 基于原 HEO 主题，融合现代化设计元素
 * 适配 NotionNext 框架
 */

import Comment from "@/components/Comment"
import LoadingCover from "@/components/LoadingCover"
import NotionPage from "@/components/NotionPage"
import ShareBar from "@/components/ShareBar"
import { siteConfig } from "@/lib/config"
import { useGlobal } from "@/lib/global"
import { loadWowJS } from "@/lib/plugins/wow"
import { useRouter } from "next/router"
import { useEffect } from "react"

import BlogPostListPage from "./components/BlogPostListPage"
import BlogPostListScroll from "./components/BlogPostListScroll"
import CategoryBar from "./components/CategoryBar"
import Footer from "./components/Footer"
import Header from "./components/Header"
import Hero from "./components/Hero"
import { NoticeBar } from "./components/NoticeBar"
import PostHeader from "./components/PostHeader"
import { PostLock } from "./components/PostLock"
import SearchNav from "./components/SearchNav"
import SideRight from "./components/SideRight"
import CONFIG from "./config"
import { Style } from "./style"

/**
 * 基础布局
 */
const LayoutBase = (props) => {
  const { children, slotTop, className } = props
  const { fullWidth, isDarkMode } = useGlobal()
  const router = useRouter()

  const headerSlot = (
    <div className="w-full">
      <Header {...props} />
      {router.route === "/" && (
        <>
          <NoticeBar {...props} />
          <Hero {...props} />
        </>
      )}
      {fullWidth ? null : <CategoryBar {...props} />}
    </div>
  )

  const slotRight = router.route === "/404" || fullWidth ? null : <SideRight {...props} />

  useEffect(() => {
    loadWowJS()
  }, [])

  return (
    <div id="theme-heo-modern" className={`${isDarkMode ? "dark" : "light"} min-h-screen`}>
      <Style />

      {/* 顶部区域 */}
      {headerSlot}

      {/* 主内容区 */}
      <div className="w-full px-4 lg:px-8 xl:px-16 2xl:px-24">
        <div className="max-w-[96rem] mx-auto flex flex-col lg:flex-row gap-8">
          {/* 主内容 */}
          <main className="flex-1 min-w-0">
            {slotTop}
            {children}
          </main>

          {/* 右侧栏 */}
          {slotRight}
        </div>
      </div>

      {/* 页脚 */}
      <Footer {...props} />

      {siteConfig("HEO_LOADING_COVER", true, CONFIG) && <LoadingCover />}
    </div>
  )
}

/**
 * 首页布局
 */
const LayoutIndex = (props) => {
  return (
    <LayoutBase {...props}>
      <CategoryBar {...props} />
      {siteConfig("POST_LIST_STYLE") === "page" ? <BlogPostListPage {...props} /> : <BlogPostListScroll {...props} />}
    </LayoutBase>
  )
}

/**
 * 博客列表布局
 */
const LayoutPostList = (props) => {
  return (
    <LayoutBase {...props}>
      <CategoryBar {...props} />
      {siteConfig("POST_LIST_STYLE") === "page" ? <BlogPostListPage {...props} /> : <BlogPostListScroll {...props} />}
    </LayoutBase>
  )
}

/**
 * 搜索页布局
 */
const LayoutSearch = (props) => {
  const { keyword } = props
  const router = useRouter()
  const currentSearch = keyword || router?.query?.s

  return (
    <LayoutBase {...props}>
      <SearchNav {...props} />
      {!currentSearch ? (
        <div className="text-center py-12">
          <p className="text-gray-500">请输入搜索关键词</p>
        </div>
      ) : (
        <div>
          {siteConfig("POST_LIST_STYLE") === "page" ? (
            <BlogPostListPage {...props} />
          ) : (
            <BlogPostListScroll {...props} />
          )}
        </div>
      )}
    </LayoutBase>
  )
}

/**
 * 文章详情页布局
 */
const LayoutSlug = (props) => {
  const { post, lock, validPassword } = props
  const { locale, fullWidth } = useGlobal()

  return (
    <LayoutBase {...props}>
      {lock && <PostLock {...props} />}

      {!lock && post && (
        <article className="max-w-4xl mx-auto">
          <PostHeader post={post} />

          <div className="prose prose-lg max-w-none">
            <NotionPage post={post} />
          </div>

          {post?.type === "Post" && (
            <div className="mt-12 space-y-8">
              <ShareBar post={post} />

              {!fullWidth && (
                <div className="border-t pt-8">
                  <Comment frontMatter={post} />
                </div>
              )}
            </div>
          )}
        </article>
      )}
    </LayoutBase>
  )
}

/**
 * 404页面布局
 */
const Layout404 = (props) => {
  return (
    <LayoutBase {...props}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">页面未找到</h1>
        <p className="text-gray-600 mb-8">请尝试站内搜索寻找文章</p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          回到主页
        </a>
      </div>
    </LayoutBase>
  )
}

/**
 * 分类列表页
 */
const LayoutCategoryIndex = (props) => {
  const { categoryOptions } = props
  const { locale } = useGlobal()

  return (
    <LayoutBase {...props}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{locale.COMMON.CATEGORY}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryOptions?.map((category) => (
            <a
              key={category.name}
              href={`/category/${category.name}`}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-500">{category.count}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </LayoutBase>
  )
}

/**
 * 标签列表页
 */
const LayoutTagIndex = (props) => {
  const { tagOptions } = props
  const { locale } = useGlobal()

  return (
    <LayoutBase {...props}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{locale.COMMON.TAGS}</h1>
        <div className="flex flex-wrap gap-3">
          {tagOptions?.map((tag) => (
            <a
              key={tag.name}
              href={`/tag/${tag.name}`}
              className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
            >
              <span>{tag.name}</span>
              <span className="ml-2 text-xs text-gray-500">({tag.count})</span>
            </a>
          ))}
        </div>
      </div>
    </LayoutBase>
  )
}

export {
  Layout404,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG,
}
