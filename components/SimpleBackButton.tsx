'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SimpleBackButton() {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      返回
    </Button>
  )
}
