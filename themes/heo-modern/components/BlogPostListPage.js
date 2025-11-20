"use client"

import { useGlobal } from "@/lib/global"
import BlogPostListScroll from "./BlogPostListScroll"

/**
 * 博客列表分页组件
 */
const BlogPostListPage = ({ posts = [], currentPage = 1, totalPages = 1 }) => {
  const { locale } = useGlobal()

  return (
    <div>
      {/* 文章列表 */}
      <BlogPostListScroll posts={posts} />

      {/* 分页导航 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2">
            {/* 上一页 */}
            <button
              disabled={currentPage <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              上一页
            </button>

            {/* 页码 */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === currentPage ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  {totalPages}
                </button>
              </>
            )}

            {/* 下一页 */}
            <button
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogPostListPage
