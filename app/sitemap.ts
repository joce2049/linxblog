import { MetadataRoute } from 'next'
import { getDatabase, getCategories } from '@/lib/notion'
import { generateArticleUrl } from '@/lib/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [articles, categories] = await Promise.all([
      getDatabase(),
      getCategories()
    ])

    const baseUrl = 'https://your-domain.com'

    // 静态页面
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/articles`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/tags`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      },
    ]

    // 文章页面
    const articlePages = articles.map((article) => ({
      url: `${baseUrl}${generateArticleUrl(article.title, article.id)}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // 分类页面
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/articles?category=${encodeURIComponent(category.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...articlePages, ...categoryPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // 返回基础页面作为回退
    return [
      {
        url: 'https://your-domain.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
