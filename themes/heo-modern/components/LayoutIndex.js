"use client"

import { useGlobal } from "@/lib/global"
import LayoutBase from "./LayoutBase"
import BlogPostListScroll from "./BlogPostListScroll"
import Hero from "./Hero"
import { useState } from "react"

/**
 * 首页布局
 * @param {*} props
 * @returns
 */
const LayoutIndex = (props) => {
  const { posts = [], categories = [], tags = [], siteInfo = {} } = props || {}
  const { locale } = useGlobal() || {}
  const [filteredPosts, setFilteredPosts] = useState(posts)

  const safePosts = Array.isArray(posts) ? posts : []
  const topPosts = safePosts.filter((post) => post && typeof post === "object" && post.isTop) || []
  const normalPosts = safePosts.filter((post) => post && typeof post === "object" && !post.isTop) || []

  return (
    <LayoutBase {...props}>
      <div className="heo-modern">
        {/* 英雄区 */}
        <Hero posts={topPosts} categories={categories} tags={tags} siteInfo={siteInfo} />

        {/* 文章列表区 */}
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
          <BlogPostListScroll posts={normalPosts} tags={tags} currentSearch="" />
        </div>
      </div>
    </LayoutBase>
  )
}

export default LayoutIndex
