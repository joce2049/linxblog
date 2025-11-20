"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

interface ShareButtonProps {
  title: string
  description: string
}

export default function ShareButton({ title, description }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // 可以添加一个提示，比如 toast 通知
      alert('链接已复制到剪贴板')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      onClick={handleShare}
    >
      <Share2 className="w-4 h-4" />
    </Button>
  )
}
