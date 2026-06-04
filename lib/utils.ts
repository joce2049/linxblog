import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并CSS类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成URL友好的slug
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '') // 移除特殊字符，保留中文、字母、数字、空格、连字符
    .replace(/\s+/g, '-') // 将空格替换为连字符
    .replace(/[\s_-]+/g, '-') // 将空格、下划线、连字符替换为单个连字符
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
    .substring(0, 100) // 限制长度，避免URL过长
}

/**
 * 根据文章标题和ID生成文章URL
 */
export function generateArticleUrl(title: string, id: string): string {
  if (!title || !id) {
    return `/articles/${id || 'unknown'}`
  }

  const slug = generateSlug(title)

  // 如果slug为空或太短，使用ID
  if (!slug || slug.length < 3) {
    return `/articles/${id}`
  }

  // 如果slug只包含数字，添加前缀避免与ID混淆
  if (/^\d+$/.test(slug)) {
    return `/articles/article-${slug}`
  }

  return `/articles/${slug}`
}

/**
 * 根据学习资源标题和ID生成资源URL（slug 规则与文章一致，仅前缀为 /resources）
 */
export function generateResourceUrl(title: string, id: string): string {
  if (!title || !id) {
    return `/resources/${id || 'unknown'}`
  }

  const slug = generateSlug(title)

  // 如果slug为空或太短，使用ID
  if (!slug || slug.length < 3) {
    return `/resources/${id}`
  }

  // 如果slug只包含数字，添加前缀避免与ID混淆
  if (/^\d+$/.test(slug)) {
    return `/resources/resource-${slug}`
  }

  return `/resources/${slug}`
}

/**
 * 从slug中提取文章ID
 * @param slug - URL slug
 * @param articles - 文章数组（可选，用于备用查找）
 * @returns 文章ID或null
 */
export function extractArticleIdFromSlug(slug: string, articles: any[] = []): string | null {
  if (!slug) return null
  
  try {
    // 1. 首先尝试URL解码
    const decodedSlug = decodeURIComponent(slug)
    console.log(`[extractArticleIdFromSlug] 原始slug: ${slug}`)
    console.log(`[extractArticleIdFromSlug] 解码后slug: ${decodedSlug}`)
    
    // 2. 尝试直接匹配文章ID（32位字符）
    const directIdMatch = decodedSlug.match(/[a-f0-9]{32}/i)
    if (directIdMatch) {
      console.log(`[extractArticleIdFromSlug] 直接ID匹配: ${directIdMatch[0]}`)
      return directIdMatch[0]
    }
    
    // 3. 尝试从slug中提取ID（处理带前缀的情况）
    const idPatterns = [
      /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i, // 标准UUID格式
      /[a-f0-9]{8}[a-f0-9]{4}[a-f0-9]{4}[a-f0-9]{4}[a-f0-9]{12}/i,    // 无连字符UUID
      /[a-f0-9]{24,32}/i,                                                // 24-32位十六进制
    ]
    
    for (const pattern of idPatterns) {
      const match = decodedSlug.match(pattern)
      if (match) {
        console.log(`[extractArticleIdFromSlug] 模式匹配ID: ${match[0]}`)
        return match[0]
      }
    }
    
    // 4. 如果有文章数组，尝试通过标题模糊匹配
    if (articles && articles.length > 0) {
      console.log(`[extractArticleIdFromSlug] 尝试标题模糊匹配，文章数量: ${articles.length}`)
      
      // 清理slug，移除特殊字符和数字前缀
      const cleanSlug = decodedSlug
        .replace(/^\d+-/, '') // 移除开头的数字和连字符
        .replace(/[^\w\u4e00-\u9fa5]/g, '') // 只保留字母、数字、中文
        .toLowerCase()
      
      console.log(`[extractArticleIdFromSlug] 清理后slug: ${cleanSlug}`)
      
      // 尝试精确匹配
      let bestMatch = null
      let bestScore = 0
      
      for (const article of articles) {
        if (!article.title) continue
        
        const cleanTitle = article.title
          .replace(/[^\w\u4e00-\u9fa5]/g, '')
          .toLowerCase()
        
        // 计算相似度分数
        let score = 0
        
        // 完全包含
        if (cleanTitle.includes(cleanSlug) || cleanSlug.includes(cleanTitle)) {
          score += 100
        }
        
        // 部分匹配
        const commonChars = [...new Set(cleanSlug)].filter(char => 
          cleanTitle.includes(char)
        ).length
        score += commonChars * 2
        
        // 长度相似度
        const lengthDiff = Math.abs(cleanTitle.length - cleanSlug.length)
        score += Math.max(0, 50 - lengthDiff)
        
        if (score > bestScore) {
          bestScore = score
          bestMatch = article
        }
      }
      
      if (bestMatch && bestScore > 30) {
        console.log(`[extractArticleIdFromSlug] 标题匹配成功: ${bestMatch.title} (分数: ${bestScore})`)
        return bestMatch.id
      }
    }
    
    // 5. 尝试从URL中提取数字ID
    const numericMatch = decodedSlug.match(/(\d+)/)
    if (numericMatch) {
      console.log(`[extractArticleIdFromSlug] 数字ID匹配: ${numericMatch[1]}`)
      // 这里可以返回数字ID，但需要确保数据库中有对应的文章
    }
    
    console.log(`[extractArticleIdFromSlug] 无法提取文章ID`)
    return null
    
  } catch (error) {
    console.error(`[extractArticleIdFromSlug] 错误:`, error)
    return null
  }
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return '未知日期'
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }

  return new Intl.DateTimeFormat('zh-CN', defaultOptions).format(dateObj)
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)}个月前`
  } else {
    return `${Math.floor(diffInSeconds / 31536000)}年前`
  }
}

/**
 * 格式化数字（添加千分位分隔符）
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text || text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + suffix
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 生成随机ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否为触摸设备
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 获取URL参数
 */
export function getUrlParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * 设置URL参数
 */
export function setUrlParam(name: string, value: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(name, value)
  window.history.replaceState({}, '', url.toString())
}

/**
 * 移除URL参数
 */
export function removeUrlParam(name: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.delete(name)
  window.history.replaceState({}, '', url.toString())
}
