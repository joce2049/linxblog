"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface HomeCategoryFilterProps {
  currentCategory?: string
  totalCount: number
}

export default function HomeCategoryFilter({ 
  currentCategory, 
  totalCount 
}: HomeCategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 固定的分类选项，不依赖动态数据
  const fixedCategories = [
    { name: '视频', color: 'blue' },
    { name: '平面', color: 'green' },
    { name: '三维', color: 'purple' },
    { name: '音频', color: 'orange' }
  ]

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
      params.delete('page') // 重置到第一页
    } else {
      params.set('category', category)
      params.delete('page') // 重置到第一页
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={currentCategory ? "outline" : "default"} 
        size="sm" 
        className={currentCategory ? "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900" : "bg-blue-600 hover:bg-blue-700 text-white"}
        onClick={() => handleCategoryChange('all')}
      >
        全部
      </Button>
      {fixedCategories.map((category) => (
        <Button
          key={category.name}
          variant={currentCategory === category.name ? "default" : "outline"}
          size="sm"
          className={currentCategory === category.name ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
          onClick={() => handleCategoryChange(category.name)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
