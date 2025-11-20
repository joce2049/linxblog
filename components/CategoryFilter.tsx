"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface CategoryFilterProps {
  categories: Array<{ name: string; color?: string }>
  currentCategory?: string
}

export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    // 保持当前页面参数，只更新分类
    router.push(`/articles?${params.toString()}`)
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
      {categories.map((category) => (
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
