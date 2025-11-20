"use client"

import { useEffect } from 'react'

interface StructuredDataProps {
  type: 'article' | 'website' | 'breadcrumb' | 'organization'
  data: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // 移除已存在的结构化数据
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(script => script.remove())

    // 创建新的结构化数据
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    
    let jsonLd = {}
    
    switch (type) {
      case 'website':
        jsonLd = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": data.name || "LinX 后期工坊",
          "description": data.description || "基于 Notion 数据库构建的知识分享平台",
          "url": data.url || "https://your-domain.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://your-domain.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        }
        break
        
      case 'article':
        jsonLd = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "author": {
            "@type": "Person",
            "name": data.author || "LinX Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "LinX",
            "logo": {
              "@type": "ImageObject",
              "url": "https://your-domain.com/logo.png"
            }
          },
          "datePublished": data.publishedTime,
          "dateModified": data.modifiedTime || data.publishedTime,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url
          },
          "articleSection": data.category,
          "keywords": data.tags?.join(', ') || data.keywords
        }
        break
        
      case 'breadcrumb':
        jsonLd = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        }
        break
        
      case 'organization':
        jsonLd = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "LinX",
          "url": "https://your-domain.com",
          "logo": "https://your-domain.com/logo.png",
          "description": "基于 Notion 数据库构建的知识分享平台",
          "sameAs": [
            "https://github.com/linx",
            "https://twitter.com/linx"
          ]
        }
        break
    }
    
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
    
    return () => {
      // 清理函数
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [type, data])

  return null
}
