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
      <SelectTrigger className="w-[180px] bg-gray-50/80 border border-blue-200/50 hover:border-blue-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white text-gray-900 rounded-xl transition-all duration-200">
        <SelectValue placeholder="选择排序方式" className="text-gray-900" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-blue-200/50 shadow-xl shadow-blue-500/10 rounded-xl">
        <SelectItem value="newest" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer text-gray-900 rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-blue-100 data-[highlighted]:text-gray-900">最新发布</SelectItem>
        <SelectItem value="oldest" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer text-gray-900 rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-blue-100 data-[highlighted]:text-gray-900">最早发布</SelectItem>
        <SelectItem value="popular" className="hover:bg-blue-50 focus:bg-blue-100 cursor-pointer text-gray-900 rounded-lg mx-2 my-1 transition-colors duration-200 data-[highlighted]:bg-blue-100 data-[highlighted]:text-gray-900">最受欢迎</SelectItem>
      </SelectContent>
    </Select>
  )
}
