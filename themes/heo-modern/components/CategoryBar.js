"use client"

import { useGlobal } from "@/lib/global"
import Link from "next/link"

/**
 * 分类栏组件
 */
const CategoryBar = ({ categoryOptions = [], currentCategory }) => {
  const { locale } = useGlobal()

  if (!categoryOptions || categoryOptions.length === 0) {
    return null
  }

  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-600 mr-4">分类筛选：</span>

        {/* 全部分类 */}
        <Link
          href="/"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            !currentCategory ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          全部
        </Link>

        {/* 分类列表 */}
        {categoryOptions.map((category) => (
          <Link
            key={category.name}
            href={`/category/${category.name}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              currentCategory === category.name
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
            <span className="ml-1 text-xs opacity-75">({category.count})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CategoryBar
