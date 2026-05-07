"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/articles?${params.toString()}`)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center mt-12">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            if (pageNum > totalPages) return null
            
            return (
              <Button
                key={pageNum}
                variant={pageNum === currentPage ? "default" : "outline"}
                size="sm"
                className={pageNum === currentPage ? "bg-primary hover:bg-primary/90 text-white" : "border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground"}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="border-border bg-card text-foreground/80 hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
