'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ShareButton from "@/components/ShareButton"
import DownloadButton from "@/components/DownloadButton"

interface ArticleActionsProps {
  title: string
  description: string
  url?: string
}

export default function ArticleActions({ title, description, url }: ArticleActionsProps) {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="outline"
        onClick={handleBack}
        className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>
      <div className="flex space-x-2">
        <ShareButton title={title} description={description} />
        <DownloadButton url={url} size="lg" />
      </div>
    </div>
  )
}
