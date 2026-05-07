"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { siteConfig } from "@/config/site"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

interface CategoryFilterProps {
  categories: Array<{ name: string; color?: string; count?: number }>
  currentCategory?: string
}

export default function ConfigurableCategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllCategories, setShowAllCategories] = useState(false)
  
  // 从配置文件获取分类筛选器配置
  const filterConfig = siteConfig.features.categoryManagement?.filter
  
  if (!filterConfig?.enabled) {
    return null // 如果分类筛选器被禁用，则不显示
  }

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

  // 根据配置处理分类可见性和排序
  const getVisibleCategories = () => {
    let processedCategories = [...categories]
    
    // 根据配置的可见性模式处理分类
    if (filterConfig.visibility.mode === 'custom') {
      const { show, hide } = filterConfig.visibility.custom
      
      // 如果配置了要隐藏的分类，则隐藏它们
      if (hide.length > 0) {
        processedCategories = processedCategories.filter(cat => 
          !hide.includes(cat.name)
        )
      }
      
      // 注意：不再过滤 show 数组，显示所有未被隐藏的分类
      // 这样可以保持所有分类可见，只是按优先级排序
    }
    
    // 根据配置的顺序重新排序（优先级排序）
    if (filterConfig.visibility.order && filterConfig.visibility.order.length > 0) {
      processedCategories.sort((a, b) => {
        const aIndex = filterConfig.visibility.order.indexOf(a.name)
        const bIndex = filterConfig.visibility.order.indexOf(b.name)
        
        // 配置中指定的分类排在前面
        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        
        return aIndex - bIndex
      })
    }
    
    return processedCategories
  }

  const visibleCategories = getVisibleCategories()
  const shouldShowExpandButton = visibleCategories.length > filterConfig.maxVisible
  const displayedCategories = showAllCategories 
    ? visibleCategories 
    : visibleCategories.slice(0, filterConfig.maxVisible)

  // 获取按钮样式类 - 统一美观的样式
  const getButtonClasses = (isActive: boolean) => {
    const baseClasses = `transition-all duration-200 font-medium`
    
    if (isActive) {
      // 选中状态：蓝色主题，保持与"全部"按钮一致
      return `${baseClasses} bg-primary hover:bg-primary/90 text-white border-primary`
    } else {
      // 未选中状态：统一的线框风格
      return `${baseClasses} border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground hover:border-gray-400`
    }
  }

  return (
    <div className="space-y-4">
      {/* 分类筛选器标题 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground/80">分类筛选</h3>
        {shouldShowExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs text-muted-foreground hover:text-foreground/80"
          >
            {showAllCategories ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                展开 ({visibleCategories.length - filterConfig.maxVisible})
              </>
            )}
          </Button>
        )}
      </div>

      {/* 分类按钮 */}
      <div className="flex flex-wrap gap-3">
        {/* "全部"按钮 */}
        {filterConfig.showAllButton && (
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
            {filterConfig.styling.showCount && (
              <span className="ml-1 text-xs opacity-75">
                ({categories.length})
              </span>
            )}
          </Button>
        )}

        {/* 分类按钮 */}
        {displayedCategories.map((category) => (
          <Button
            key={category.name}
            variant="outline"
            size="default"
            className={`${getButtonClasses(currentCategory === category.name)} px-4 py-2`}
            onClick={() => handleCategoryChange(category.name)}
          >
            {category.name}
            {filterConfig.styling.showCount && category.count !== undefined && (
              <span className="ml-1 text-xs opacity-75">
                ({category.count})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* 展开/收起提示 */}
      {shouldShowExpandButton && !showAllCategories && (
        <div className="text-xs text-muted-foreground text-center">
          还有 {visibleCategories.length - filterConfig.maxVisible} 个分类，点击展开查看
        </div>
      )}
    </div>
  )
}
