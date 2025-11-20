"use client"

import { useGlobal } from "@/lib/global"
import { siteConfig } from "@/lib/config"
import CONFIG from "../config"

/**
 * 右侧边栏组件
 */
const SideRight = ({ latestPosts = [], tags = [], categories = [] }) => {
  const { locale } = useGlobal()
  const showLatestPosts = siteConfig("HEO_MODERN_WIDGET_LATEST_POSTS", true, CONFIG)
  const showAnalytics = siteConfig("HEO_MODERN_WIDGET_ANALYTICS", true, CONFIG)

  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* 最新文章 */}
      {showLatestPosts && latestPosts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">最新文章</h3>
          <div className="space-y-3">
            {latestPosts.slice(0, 5).map((post) => (
              <a
                key={post.id}
                href={`/${post.slug}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{post.title}</h4>
                <p className="text-xs text-gray-500">{post.publishDay}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 热门标签 */}
      {tags.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">热门标签</h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 20).map((tag) => (
              <a
                key={tag.name}
                href={`/tag/${tag.name}`}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-sm text-gray-700 hover:text-blue-600 rounded-full transition-colors"
              >
                {tag.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {showAnalytics && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">网站统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">文章总数</span>
              <span className="font-semibold">{latestPosts.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">分类数量</span>
              <span className="font-semibold">{categories.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">标签数量</span>
              <span className="font-semibold">{tags.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default SideRight
