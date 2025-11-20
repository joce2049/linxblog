"use client"

import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"

interface TagFilterProps {
  tags: string[]
  currentTags: string[]
}

export default function TagFilter({ tags, currentTags }: TagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTagToggle = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    if (newTags.length === 0) {
      params.delete('tags')
    } else {
      params.set('tags', newTags.join(','))
    }
    router.push(`/articles?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={currentTags.includes(tag) ? "default" : "secondary"}
          className={`cursor-pointer transition-colors ${
            currentTags.includes(tag)
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleTagToggle(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
