"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Home,
  FileText,
  Folder,
  Tag,
  Info,
  ChevronDown,
  Menu,
  X,
  Search,
  ExternalLink,
} from 'lucide-react'
import { siteConfig } from '@/config/site'
import type { NavItem } from '@/config/site'

interface NavigationItem extends NavItem {}

interface ConfigurableNavigationProps {
  categories: Array<{ name: string; color?: string }>
}

export default function ConfigurableNavigation({ categories }: ConfigurableNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 从配置文件获取导航配置
  const navigationItems: NavigationItem[] = siteConfig.navigation.main.map(item => {
    const baseItem: NavigationItem = {
      name: item.name,
      href: item.href,
      icon: item.icon,
      visible: item.visible ?? true,
      external: item.external,
    }

    // children: "categories" 表示从分类配置动态生成
    if (item.children === 'categories') {
      const categoryOrder = siteConfig.features.categoryManagement.filter.visibility.order
      baseItem.children = categoryOrder.map(categoryName => ({
        name: categoryName,
        href: `/articles?category=${encodeURIComponent(categoryName)}`,
        icon: 'Folder',
        visible: true,
      }))
    } else if (Array.isArray(item.children)) {
      baseItem.children = item.children
    }

    return baseItem
  })

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Home,
      FileText,
      Folder,
      Tag,
      Info,
      Search: FileText,
      ExternalLink,
    }
    return iconMap[iconName] || FileText
  }

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    if (!item.visible) return null

    const IconComponent = getIcon(item.icon)
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)

    const children = hasChildren ? item.children as NavigationItem[] : []

    // 渲染子菜单项的函数
    const renderChildItem = (child: NavigationItem, isMobileChild: boolean = false) => {
      const ChildIconComponent = getIcon(child.icon)
      const className = `flex items-center space-x-2 px-4 py-2 text-sm transition-colors ${
        isMobileChild
          ? 'text-gray-600 hover:text-blue-600'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`

      const content = (
        <>
          <ChildIconComponent className="w-4 h-4" />
          <span>{child.name}</span>
          {child.external && <ExternalLink className="w-3 h-3 text-gray-400" />}
        </>
      )

      if (child.external) {
        return (
          <a
            key={child.name}
            href={child.href}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => isMobileChild && setIsMobileMenuOpen(false)}
          >
            {content}
          </a>
        )
      }

      return (
        <Link
          key={child.name}
          href={child.href}
          className={className}
          onClick={() => isMobileChild && setIsMobileMenuOpen(false)}
        >
          {content}
        </Link>
      )
    }

    const buttonContent = (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(item.name)
          } else {
            setIsMobileMenuOpen(false)
          }
        }}
      >
        <IconComponent className="w-4 h-4" />
        <span>{item.name}</span>
        {item.external && <ExternalLink className="w-3 h-3 text-gray-400" />}
        {hasChildren && (
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        )}
      </Button>
    )

    if (hasChildren) {
      return (
        <div key={item.name} className="relative group">
          {buttonContent}

          {/* 桌面端下拉菜单 */}
          {!isMobile && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {children.map((child) => renderChildItem(child))}
              </div>
            </div>
          )}

          {/* 移动端展开菜单 */}
          {isMobile && isExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              {children.map((child) => renderChildItem(child, true))}
            </div>
          )}
        </div>
      )
    }

    // 外部链接使用 <a> 标签
    if (item.external) {
      return (
        <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">
          {buttonContent}
        </a>
      )
    }

    return (
      <Link key={item.name} href={item.href}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <header className="backdrop-blur-md bg-white/80 border-b border-white/20 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-200">
                {siteConfig.brand.name}
              </span>
              <div className="text-xs text-muted-foreground">{siteConfig.brand.tagline}</div>
            </div>
          </Link>

          {/* 桌面端导航 - 居中 */}
          <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {navigationItems.map(item => renderNavigationItem(item))}
          </nav>

          {/* 右侧搜索栏 */}
          <div className="hidden md:flex items-center space-x-2">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="搜索资源..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-10 pr-4 py-2 text-sm bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white focus:border-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-900"
              />
            </form>
          </div>

          {/* 移动端菜单按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* 移动端搜索栏 */}
            <div className="mb-4 px-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索资源..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-900"
                />
              </form>
            </div>

            <nav className="space-y-2">
              {navigationItems.map(item => renderNavigationItem(item, true))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
