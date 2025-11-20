"use client"

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import StructuredData from './StructuredData'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const allItems = [
    { name: '首页', url: '/' },
    ...items
  ]

  return (
    <>
      {/* 结构化数据 */}
      <StructuredData 
        type="breadcrumb" 
        data={{ items: allItems }} 
      />
      
      {/* 面包屑导航 */}
      <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="面包屑导航">
        {allItems.map((item, index) => (
          <div key={item.url} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            )}
            
            {index === allItems.length - 1 ? (
              // 当前页面
              <span className="text-gray-900 font-medium" aria-current="page">
                {index === 0 ? (
                  <Home className="w-4 h-4 inline mr-1" />
                ) : null}
                {item.name}
              </span>
            ) : (
              // 可点击的链接
              <Link 
                href={item.url}
                className="hover:text-blue-600 transition-colors flex items-center"
              >
                {index === 0 ? (
                  <Home className="w-4 h-4 inline mr-1" />
                ) : null}
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}
