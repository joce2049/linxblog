import { NextResponse } from 'next/server'
import { getDatabase, getCategories } from '@/lib/notion'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
