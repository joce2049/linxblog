import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/notion'

export async function GET() {
  try {
    const articles = await getDatabase()
    
    // 分析图片数据
    const imageAnalysis = articles.map(article => ({
      id: article.id,
      title: article.title,
      hasImage: !!article.image,
      imageUrl: article.image,
      imageType: article.image ? (article.image.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ? 'Notion S3' : 'External') : 'None',
      category: article.category,
      tags: article.tags
    }))
    
    const stats = {
      total: articles.length,
      withImages: imageAnalysis.filter(a => a.hasImage).length,
      withoutImages: imageAnalysis.filter(a => !a.hasImage).length,
      notionS3Images: imageAnalysis.filter(a => a.imageType === 'Notion S3').length,
      externalImages: imageAnalysis.filter(a => a.imageType === 'External').length
    }
    
    return NextResponse.json({
      stats,
      articles: imageAnalysis.slice(0, 20), // 只返回前20个用于调试
      sampleImages: imageAnalysis.filter(a => a.hasImage).slice(0, 10)
    })
  } catch (error) {
    console.error('Debug images error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
