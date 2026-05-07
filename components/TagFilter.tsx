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
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-muted text-foreground/80 hover:bg-muted"
          }`}
          onClick={() => handleTagToggle(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
