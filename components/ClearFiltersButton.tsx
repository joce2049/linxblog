"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ClearFiltersButton({ basePath = '/articles' }: { basePath?: string }) {
  const router = useRouter()

  const handleClearFilters = () => {
    router.push(basePath)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:bg-primary/20"
      onClick={handleClearFilters}
    >
      清除筛选
    </Button>
  )
}
