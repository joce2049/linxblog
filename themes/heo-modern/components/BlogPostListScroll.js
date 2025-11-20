import LazyImage from "@/components/LazyImage"
import { siteConfig } from "@/lib/config"
import { useGlobal } from "@/lib/global"
import Link from "next/link"
import CONFIG from "../config"

/**
 * 博客列表滚动组件
 */
const BlogPostListScroll = ({ posts = [] }) => {
  const { locale } = useGlobal() || {}
  const showCover = siteConfig("HEO_POST_LIST_COVER", true, CONFIG)
  const showSummary = siteConfig("HEO_POST_LIST_SUMMARY", true, CONFIG)

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{locale?.COMMON?.NO_POSTS || "No posts found"}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {posts.map((post, index) => {
          if (!post || typeof post !== "object" || post === null) {
            console.warn(`[HEO-MODERN] Invalid post at index ${index}:`, post)
            return null
          }

          const postId = post.id || post.slug || `post-${index}`
          const postSlug = post.slug || "#"
          const postTitle = post.title || "Untitled"
          const postSummary = post.summary || post.excerpt || ""
          const postCover = post.pageCoverThumbnail || post.cover || ""
          const postCategory = post.category || ""
          const postPublishDay = post.publishDay || post.date || ""
          const postReadTime = post.readTime || ""

          return (
            <article
              key={postId}
              className="bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link href={`/${postSlug}`}>
                <div className="flex flex-col h-full">
                  {showCover && postCover && (
                    <div className="relative overflow-hidden">
                      <LazyImage src={postCover} alt={postTitle} className="w-full aspect-video object-cover" />
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">{postTitle}</h2>

                    {showSummary && postSummary && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{postSummary}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                      <div className="flex items-center space-x-2">
                        {postCategory && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{postCategory}</span>
                        )}
                        {postPublishDay && <time dateTime={postPublishDay}>{postPublishDay}</time>}
                      </div>

                      <div className="flex items-center space-x-2">
                        {postReadTime && <span>{postReadTime} min</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default BlogPostListScroll
