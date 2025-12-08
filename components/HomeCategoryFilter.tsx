"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { siteConfig } from "@/config/site"

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

  // 从配置文件读取分类列表
  const categories = siteConfig.features.categoryManagement.filter.visibility.order

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
      {categories.map((categoryName) => (
        <Button
          key={categoryName}
          variant={currentCategory === categoryName ? "default" : "outline"}
          size="sm"
          className={currentCategory === categoryName ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
          onClick={() => handleCategoryChange(categoryName)}
        >
          {categoryName}
        </Button>
      ))}
    </div>
  )
}
