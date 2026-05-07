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
        className={currentCategory ? "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground" : "bg-primary hover:bg-primary/90 text-white"}
        onClick={() => handleCategoryChange('all')}
      >
        全部
      </Button>
      {categories.map((category) => (
        <Button
          key={category.name}
          variant={currentCategory === category.name ? "default" : "outline"}
          size="sm"
          className={currentCategory === category.name ? "bg-primary hover:bg-primary/90 text-white" : "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"}
          onClick={() => handleCategoryChange(category.name)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}
