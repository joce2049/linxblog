import { notFound } from "next/navigation"
import { getDatabase } from "@/lib/notion"
import { getFullPageContent } from "@/lib/notion-content"

// 强制动态渲染
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TestPageProps {
    params: {
        slug: string
    }
}

export default async function TestPage({ params }: TestPageProps) {
    const rawArticles = await getDatabase()
    const articles = rawArticles as any[]

    // 查找文章
    const decodedSlug = decodeURIComponent(params.slug)
    const article = articles.find((p) => {
        if (params.slug.match(/^[a-f0-9]{32}|[a-f0-9-]{36}$/i)) {
            return p.id.replace(/-/g, "") === params.slug.replace(/-/g, "")
        }
        if (p.title === decodedSlug) return true
        const cleanSlug = decodedSlug.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase()
        const cleanTitle = p.title.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '').toLowerCase()
        return cleanSlug === cleanTitle || cleanTitle.includes(cleanSlug) || cleanSlug.includes(cleanTitle)
    })

    if (!article) {
        notFound()
    }

    // 获取完整内容
    const contentResult = await getFullPageContent(article.id) as any

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container max-w-6xl mx-auto px-4">
                {/* 头部信息 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">📊 Notion 内容测试页面</h1>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold">文章标题：</span>
                            <span className="text-gray-700">{article.title}</span>
                        </div>
                        <div>
                            <span className="font-semibold">文章 ID：</span>
                            <span className="text-gray-700 font-mono text-xs">{article.id}</span>
                        </div>
                        <div>
                            <span className="font-semibold">内容块数量：</span>
                            <span className="text-blue-600 font-bold">{contentResult.blockCount}</span>
                        </div>
                        <div>
                            <span className="font-semibold">有内容：</span>
                            <span className={contentResult.hasContent ? 'text-green-600' : 'text-red-600'}>
                                {contentResult.hasContent ? '✅ 是' : '❌ 否'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 内容块类型分布 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📦 内容块类型分布</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(contentResult.typeDistribution).map(([type, count]) => (
                            <div key={type} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-xs text-gray-600 mb-1">{type}</div>
                                <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 所有内容块详情 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 所有内容块详情</h2>
                    <div className="space-y-4">
                        {contentResult.blocks.map((block: any, index: number) => (
                            <div key={block.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            #{index + 1}
                                        </span>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {block.type}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono">
                                        {block.id}
                                    </span>
                                </div>

                                {/* 内容预览 */}
                                <div className="bg-gray-50 rounded p-3 mb-2">
                                    <div className="text-xs text-gray-500 mb-1">内容预览：</div>
                                    <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                        {JSON.stringify(block[block.type], null, 2)}
                                    </pre>
                                </div>

                                {/* 时间信息 */}
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <div>
                                        创建：{new Date(block.created_time).toLocaleString('zh-CN')}
                                    </div>
                                    <div>
                                        修改：{new Date(block.last_edited_time).toLocaleString('zh-CN')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 生成的 HTML 内容 */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🎨 生成的 HTML 内容</h2>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs whitespace-pre-wrap break-words">
                            {contentResult.htmlContent}
                        </pre>
                    </div>
                </div>

                {/* 渲染效果预览 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">👁️ 渲染效果预览</h2>
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div
                            className="article-content
                [&>*]:max-w-none
                [&_h1]:scroll-mt-20
                [&_h2]:scroll-mt-20
                [&_h3]:scroll-mt-20
                [&_a]:transition-colors
                [&_img]:max-w-full
                [&_img]:h-auto
                [&_pre]:font-mono
                [&_code]:font-mono
                [&_figure]:mx-auto
                [&_blockquote]:my-8
                [&_ul]:my-6
                [&_ol]:my-6
              "
                            dangerouslySetInnerHTML={{ __html: contentResult.htmlContent }}
                        />
                    </div>
                </div>

                {/* 返回按钮 */}
                <div className="mt-8 text-center">
                    <a
                        href={`/articles/${params.slug}`}
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        ← 返回正常文章页面
                    </a>
                </div>
            </div>
        </div>
    )
}
