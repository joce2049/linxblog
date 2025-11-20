"use client"

import { siteConfig } from "@/lib/config"
import { useGlobal } from "@/lib/global"
import CONFIG from "../config"

/**
 * 英雄区组件
 */
const Hero = (props) => {
  const { siteInfo = {} } = props || {}
  const { locale } = useGlobal() || {}

  const heroEnable = siteConfig("HEO_HOME_BANNER_ENABLE", true, CONFIG)
  const title1 = siteConfig("HEO_HERO_TITLE_1", "现代化", CONFIG)
  const title2 = siteConfig("HEO_HERO_TITLE_2", "博客体验", CONFIG)
  const title3 = siteConfig("HEO_HERO_TITLE_3", "HEO MODERN", CONFIG)
  const subtitle = siteConfig("HEO_HERO_SUBTITLE", "基于NotionNext的现代化主题", CONFIG)
  const description = siteConfig("HEO_HERO_DESCRIPTION", "融合现代设计理念，提供优雅的阅读体验", CONFIG)

  if (!heroEnable) return null

  return (
    <section className="relative py-20 px-4 lg:px-8 xl:px-16 2xl:px-24 overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>

      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-[96rem] mx-auto">
        <div className="text-center">
          {/* 主标题 */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {title1}
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                {title2}
              </span>
            </h1>
            <div className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">{title3}</div>
          </div>

          {/* 副标题和描述 */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">{subtitle}</p>
            <p className="text-lg text-gray-500 leading-relaxed">{description}</p>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/archive"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              开始阅读
            </a>
            <a
              href="/about"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              了解更多
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}

export default Hero
