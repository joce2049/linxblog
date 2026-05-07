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
        className={currentCategory ? "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground" : "bg-primary hover:bg-primary/90 text-white"}
        onClick={() => handleCategoryChange('all')}
      >
        全部
      </Button>
      {categories.map((categoryName) => (
        <Button
          key={categoryName}
          variant={currentCategory === categoryName ? "default" : "outline"}
          size="sm"
          className={currentCategory === categoryName ? "bg-primary hover:bg-primary/90 text-white" : "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"}
          onClick={() => handleCategoryChange(categoryName)}
        >
          {categoryName}
        </Button>
      ))}
    </div>
  )
}
