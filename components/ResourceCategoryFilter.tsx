"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface ResourceCategoryFilterProps {
  categories: Array<{ name: string; color?: string }>
  currentCategory?: string
}

/**
 * 学习资源专属分类筛选器
 * 分类直接来自资源库动态提取，不复用文章库的可见性/排序配置，避免两套标签体系混淆
 */
export default function ResourceCategoryFilter({ categories, currentCategory }: ResourceCategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (category === 'all') {
      params.delete('category')
    } else {
      params.set('category', category)
    }
    params.delete('page') // 切换分类时回到第一页
    router.push(`/resources?${params.toString()}`)
  }

  if (!categories || categories.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground/80">分类筛选</h3>
      <div className="flex flex-wrap gap-3">
        {/* “全部”按钮 */}
        <Button
          variant="outline"
          size="default"
          className={!currentCategory
            ? "bg-primary hover:bg-primary/90 text-white border-primary font-medium px-4 py-2"
            : "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground hover:border-gray-400 font-medium px-4 py-2"
          }
          onClick={() => handleCategoryChange('all')}
        >
          全部
        </Button>

        {/* 分类按钮 */}
        {categories.map((category) => (
          <Button
            key={category.name}
            variant="outline"
            size="default"
            className={`${currentCategory === category.name
              ? "bg-primary hover:bg-primary/90 text-white border-primary"
              : "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground hover:border-gray-400"
              } font-medium px-4 py-2`}
            onClick={() => handleCategoryChange(category.name)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
