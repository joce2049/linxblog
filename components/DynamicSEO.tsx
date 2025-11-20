"use client"

import { useEffect } from 'react'
import Head from 'next/head'

interface DynamicSEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'article' | 'website'
  publishedTime?: string
  modifiedTime?: string
  author?: string
}

export default function DynamicSEO({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author
}: DynamicSEOProps) {
  useEffect(() => {
    // 动态更新页面标题
    if (title) {
      document.title = title
    }

    // 动态更新meta标签
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // 更新描述
    if (description) {
      updateMetaTag('description', description)
      updatePropertyTag('og:description', description)
      updatePropertyTag('twitter:description', description)
    }

    // 更新关键词
    if (keywords && Array.isArray(keywords) && keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '))
    }

    // 更新图片
    if (image) {
      updatePropertyTag('og:image', image)
      updatePropertyTag('twitter:image', image)
    }

    // 更新URL
    if (url) {
      updatePropertyTag('og:url', url)
      updatePropertyTag('twitter:url', url)
    }

    // 更新类型
    updatePropertyTag('og:type', type)

    // 更新发布时间
    if (publishedTime) {
      updatePropertyTag('article:published_time', publishedTime)
    }

    // 更新修改时间
    if (modifiedTime) {
      updatePropertyTag('article:modified_time', modifiedTime)
    }

    // 更新作者
    if (author) {
      updatePropertyTag('article:author', author)
    }
  }, [title, description, keywords, image, url, type, publishedTime, modifiedTime, author])

  return null
}
