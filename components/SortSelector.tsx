"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

interface SortSelectorProps {
  currentSort: string
}

export default function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px] bg-muted/50 border border-border hover:border-primary/60 focus:border-primary/60 focus:ring-2 focus:ring-ring/40 focus:ring-offset-2 focus:ring-offset-white text-foreground rounded-xl transition-all duration-200">
        <SelectValue placeholder="选择排序方式" className="text-foreground" />
      </SelectTrigger>
      <SelectContent className="bg-card border border-border rounded-xl">
        <SelectItem value="newest" className="hover:bg-accent focus:bg-primary/20 cursor-pointer text-foreground rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground">最新发布</SelectItem>
        <SelectItem value="oldest" className="hover:bg-accent focus:bg-primary/20 cursor-pointer text-foreground rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground">最早发布</SelectItem>
        <SelectItem value="popular" className="hover:bg-accent focus:bg-primary/20 cursor-pointer text-foreground rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-primary/20 data-[highlighted]:text-foreground">最受欢迎</SelectItem>
      </SelectContent>
    </Select>
  )
}
