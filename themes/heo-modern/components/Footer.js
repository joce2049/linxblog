"use client"

import { useGlobal } from "@/lib/global"
import BLOG from "@/blog.config"
import CONFIG from "../config"
import { useState, useEffect } from "react"

/**
 * 页脚组件
 * @param {*} props
 * @returns
 */
const Footer = (props) => {
  const { locale } = useGlobal()
  const [runtime, setRuntime] = useState("")

  // 计算运行时间
  useEffect(() => {
    if (CONFIG.HEO_FOOTER_SHOW_RUNTIME) {
      const startDate = new Date(CONFIG.HEO_FOOTER_RUNTIME_START_DATE)

      const updateRuntime = () => {
        const now = new Date()
        const diff = now - startDate
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        setRuntime(`${days}天${hours}小时${minutes}分钟${seconds}秒`)
      }

      updateRuntime()
      const interval = setInterval(updateRuntime, 1000)

      return () => clearInterval(interval)
    }
  }, [])

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 网站信息 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={BLOG.AVATAR || "/logo.png"} alt="Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold">{BLOG.TITLE}</span>
            </div>
            <p className="text-gray-400 mb-4">{BLOG.DESCRIPTION || "基于NotionNext的现代化博客主题"}</p>

            {CONFIG.HEO_FOOTER_SHOW_SOCIAL_LINKS && CONFIG.HEO_FOOTER_SOCIAL_LINKS && (
              <div className="flex space-x-4">
                {CONFIG.HEO_FOOTER_SOCIAL_LINKS.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  首页
                </a>
              </li>
              <li>
                <a href="/archive" className="text-gray-400 hover:text-white transition-colors">
                  归档
                </a>
              </li>
              <li>
                <a href="/category" className="text-gray-400 hover:text-white transition-colors">
                  分类
                </a>
              </li>
              <li>
                <a href="/tag" className="text-gray-400 hover:text-white transition-colors">
                  标签
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  关于
                </a>
              </li>
            </ul>
          </div>

          {/* 统计信息 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">网站统计</h3>
            <ul className="space-y-2 text-gray-400">
              {CONFIG.HEO_FOOTER_SHOW_RUNTIME && (
                <li>
                  <i className="fas fa-clock mr-2"></i>
                  运行时间: {runtime}
                </li>
              )}
              <li>
                <i className="fas fa-code mr-2"></i>
                基于 NotionNext
              </li>
              <li>
                <i className="fas fa-heart mr-2 text-red-500"></i>
                HEO Modern 主题
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{CONFIG.HEO_FOOTER_COPYRIGHT}</p>
          {CONFIG.HEO_FOOTER_ICP && <p className="text-gray-500 text-sm mt-2">{CONFIG.HEO_FOOTER_ICP}</p>}
        </div>
      </div>
    </footer>
  )
}

export default Footer
