"use client"

import { useGlobal } from "@/lib/global"

/**
 * 文章头部组件
 */
const PostHeader = ({ post }) => {
  const { locale } = useGlobal()

  if (!post) return null

  return (
    <header className="mb-8">
      {/* 文章封面 */}
      {post.pageCover && (
        <div className="mb-8 -mx-4 lg:-mx-8">
          <img
            src={post.pageCover || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
        </div>
      )}

      {/* 文章标题 */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

      {/* 文章元信息 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center space-x-2">
          <span>发布于</span>
          <time dateTime={post.publishDay}>{post.publishDay}</time>
        </div>

        {post.category && (
          <div className="flex items-center space-x-2">
            <span>分类</span>
            <a href={`/category/${post.category}`} className="text-blue-600 hover:underline">
              {post.category}
            </a>
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center space-x-2">
            <span>标签</span>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/tag/${tag}`}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-blue-100 hover:text-blue-600 transition-colors"
                >
                  {tag}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 文章摘要 */}
      {post.summary && (
        <div className="text-lg text-gray-600 leading-relaxed mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
          {post.summary}
        </div>
      )}
    </header>
  )
}

export default PostHeader
