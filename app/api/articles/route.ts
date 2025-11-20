import { NextResponse } from 'next/server'
import { getDatabase, getCategories } from '@/lib/notion'

export async function GET() {
  try {
    const [articles, categories] = await Promise.all([
      getDatabase(),
      getCategories()
    ])

    return NextResponse.json({
      articles,
      categories,
      total: articles.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
