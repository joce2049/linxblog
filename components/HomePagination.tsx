"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface HomePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export default function HomePagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage 
}: HomePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    
    const params = new URLSearchParams(searchParams)
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    
    // 使用 router.push 而不是 window.location 提升流畅性
    router.push(`/?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  // 计算显示的页码范围
  const getVisiblePages = () => {
    const delta = 2 // 当前页前后显示的页数
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col items-center space-y-4 mt-12">
      {/* 分页信息 */}
      <div className="text-sm text-gray-600">
        显示第 {startItem}-{endItem} 条，共 {totalItems} 条
      </div>
      
      {/* 分页按钮 */}
      <div className="flex items-center space-x-1">
        {/* 上一页 */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一页
        </Button>
        
        {/* 页码 */}
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page as number)}
                className={page === currentPage ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
              >
                {page}
              </Button>
            )}
          </div>
        ))}
        
        {/* 下一页 */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* 快速跳转 */}
      {totalPages > 10 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>快速跳转：</span>
          <div className="flex space-x-1">
            {[1, Math.ceil(totalPages / 2), totalPages].map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page)}
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-2 py-1 h-auto"
              >
                {page === Math.ceil(totalPages / 2) ? '中间' : page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
