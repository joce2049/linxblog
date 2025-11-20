"use client"

import { useState } from "react"
import { useRouter } from "next/router"

/**
 * 搜索导航组件
 */
const SearchNav = ({ keyword }) => {
  const [searchTerm, setSearchTerm] = useState(keyword || "")
  const router = useRouter()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?s=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">搜索文章</h1>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入关键词搜索..."
            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            搜索
          </button>
        </form>

        {keyword && (
          <div className="mt-6 text-center text-gray-600">
            搜索结果：<span className="font-semibold">"{keyword}"</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchNav
