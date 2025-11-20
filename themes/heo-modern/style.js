"use client"

import { siteConfig } from "@/lib/config"
import CONFIG from "./config"

export const Style = () => {
  const primaryColor = siteConfig("HEO_PRIMARY_COLOR", "#3b82f6", CONFIG)
  const accentColor = siteConfig("HEO_ACCENT_COLOR", "#10b981", CONFIG)

  return (
    <style jsx global>{`
      /* HEO Modern 主题样式 */
      #theme-heo-modern {
        --primary-color: ${primaryColor};
        --accent-color: ${accentColor};
        --gradient-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --card-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      /* 全局样式重置 */
      #theme-heo-modern * {
        box-sizing: border-box;
      }

      /* 文章卡片样式 */
      .heo-modern-post-card {
        @apply bg-white rounded-xl overflow-hidden transition-all duration-300 cursor-pointer;
        box-shadow: var(--card-shadow);
      }

      .heo-modern-post-card:hover {
        box-shadow: var(--card-shadow-hover);
        transform: translateY(-2px);
      }

      /* 文章卡片图片 */
      .heo-modern-post-image {
        @apply w-full aspect-video object-cover;
      }

      /* 文章卡片内容 */
      .heo-modern-post-content {
        @apply p-4;
      }

      /* 文章标题 */
      .heo-modern-post-title {
        @apply text-lg font-semibold text-gray-900 mb-2 line-clamp-2;
      }

      /* 文章摘要 */
      .heo-modern-post-summary {
        @apply text-sm text-gray-600 mb-3 line-clamp-3;
      }

      /* 文章元信息 */
      .heo-modern-post-meta {
        @apply flex items-center justify-between text-xs text-gray-500;
      }

      /* 响应式网格 */
      .heo-modern-grid {
        @apply grid gap-6;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      @media (min-width: 640px) {
        .heo-modern-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1024px) {
        .heo-modern-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      @media (min-width: 1280px) {
        .heo-modern-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      @media (min-width: 1536px) {
        .heo-modern-grid {
          grid-template-columns: repeat(5, 1fr);
        }
      }

      /* 深色模式 */
      #theme-heo-modern.dark .heo-modern-post-card {
        @apply bg-gray-800;
      }

      #theme-heo-modern.dark .heo-modern-post-title {
        @apply text-white;
      }

      #theme-heo-modern.dark .heo-modern-post-summary {
        @apply text-gray-300;
      }

      #theme-heo-modern.dark .heo-modern-post-meta {
        @apply text-gray-400;
      }

      /* 动画效果 */
      .heo-modern-fade-in {
        animation: heoModernFadeIn 0.6s ease-out;
      }

      @keyframes heoModernFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* 加载动画 */
      .heo-modern-loading {
        @apply animate-pulse bg-gray-200 rounded;
      }

      #theme-heo-modern.dark .heo-modern-loading {
        @apply bg-gray-700;
      }
    `}</style>
  )
}

export default Style
