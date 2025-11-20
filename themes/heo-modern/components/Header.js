"use client"
import { useGlobal } from "@/lib/global"
import Link from "next/link"
import { useState } from "react"

/**
 * 顶部导航栏
 */
const Header = (props) => {
  const { locale } = useGlobal()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { name: locale.NAV.INDEX, href: "/", show: true },
    { name: locale.NAV.CATEGORY, href: "/category", show: true },
    { name: locale.NAV.TAG, href: "/tag", show: true },
    { name: locale.NAV.ARCHIVE, href: "/archive", show: true },
    { name: locale.NAV.SEARCH, href: "/search", show: true },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="w-full px-4 lg:px-8 xl:px-16 2xl:px-24">
        <div className="max-w-[96rem] mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HeoNext
              </div>
              <span className="text-xs text-gray-500 hidden sm:block">基于NotionNext</span>
            </Link>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems
                .filter((item) => item.show)
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
            </nav>

            {/* 移动端菜单按钮 */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* 移动端导航菜单 */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                {menuItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
