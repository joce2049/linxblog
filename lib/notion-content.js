import { Client } from '@notionhq/client'
import { envConfig } from '@/config/site'

const notion = new Client({
  auth: envConfig.notion.apiKey,
})

// 内存缓存 - TTL 设置为 50 分钟
const contentCache = {
  pages: {}, // 存储页面内容 { pageId: { data, timestamp } }
  ttl: 10 * 1000 // 10秒
}

// 检查缓存是否有效
function isContentCacheValid(pageId) {
  const cached = contentCache.pages[pageId]
  if (!cached) return false
  return Date.now() - cached.timestamp < contentCache.ttl
}

// 设置缓存
function setContentCache(pageId, data) {
  contentCache.pages[pageId] = {
    data,
    timestamp: Date.now()
  }
}

/**
 * 递归获取所有子块
 * @param {string} blockId - 块ID
 * @param {number} depth - 递归深度
 * @returns {Promise<Array>} 所有子块的数组
 */
async function getAllChildBlocks(blockId, depth = 0) {
  if (depth > 10) {
    console.warn('⚠️ 达到最大递归深度，停止获取')
    return []
  }

  try {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100, // 每次获取最多100个
    })

    const blocks = response.results || []
    const allBlocks = []

    for (const block of blocks) {
      allBlocks.push(block)

      // 如果块有子内容，递归获取
      if (block.has_children) {
        const childBlocks = await getAllChildBlocks(block.id, depth + 1)
        allBlocks.push(...childBlocks)
      }
    }

    return allBlocks
  } catch (error) {
    console.error(`❌ 获取块 ${blockId} 的子内容失败:`, error.message)
    return []
  }
}

/**
 * 获取Notion页面的所有内容块（包括嵌套块）
 * @param {string} pageId - 页面ID
 * @returns {Promise<Array>} 内容块数组
 */
export async function getPageContent(pageId) {
  try {
    console.log('🔍 开始获取页面内容，页面ID:', pageId)

    if (!notion) {
      console.error('❌ Notion客户端未初始化')
      return []
    }

    // 递归获取所有块，包括嵌套的
    const allBlocks = await getAllChildBlocks(pageId)

    console.log('✅ 成功获取所有页面内容，总块数量:', allBlocks.length)
    console.log('📊 内容块类型统计:', allBlocks.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1
      return acc
    }, {}))

    return allBlocks
  } catch (error) {
    console.error('❌ 获取页面内容失败:', error.message)
    console.error('错误详情:', error)

    // 详细的错误分析
    if (error.code === 'unauthorized') {
      console.error('🔑 认证失败：请检查API密钥')
    } else if (error.code === 'object_not_found') {
      console.error('🔍 页面未找到：请检查页面ID是否正确')
    } else if (error.code === 'rate_limited') {
      console.error('⏱️ 请求频率限制：请稍后重试')
    }

    return []
  }
}

/**
 * 解析富文本为HTML
 * @param {Array} richTextArray - Notion富文本数组
 * @returns {string} HTML内容
 */
function parseRichText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return ''

  return richTextArray.map(text => {
    let content = text.plain_text

    // 处理链接
    if (text.href) {
      content = `<a href="${text.href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline decoration-blue-400 hover:decoration-blue-600 transition-colors">${content}</a>`
    } else {
      // 处理文本样式
      if (text.annotations?.bold) {
        content = `<strong class="font-semibold text-gray-900">${content}</strong>`
      }
      if (text.annotations?.italic) {
        content = `<em class="italic">${content}</em>`
      }
      if (text.annotations?.strikethrough) {
        content = `<del class="line-through text-gray-500">${content}</del>`
      }
      if (text.annotations?.underline) {
        content = `<u class="underline decoration-gray-400">${content}</u>`
      }
      if (text.annotations?.code) {
        content = `<code class="px-1.5 py-0.5 mx-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">${content}</code>`
      }
    }

    return content
  }).join('')
}

/**
 * 生成标题锚点ID
 * @param {string} text - 标题文本
 * @returns {string} 锚点ID
 */
function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}

/**
 * 解析内容块为HTML内容
 * @param {Array} blocks - 内容块数组
 * @returns {string} HTML内容
 */
export function parseContentBlocks(blocks) {
  if (!blocks || blocks.length === 0) {
    return ''
  }

  let htmlContent = ''
  let inList = false
  let listType = ''

  blocks.forEach((block, index) => {
    switch (block.type) {
      case 'paragraph':
        if (block.paragraph?.rich_text?.length > 0) {
          const richText = parseRichText(block.paragraph.rich_text)
          // 检查是否为列表项之间的空行
          const nextBlock = blocks[index + 1]
          if (nextBlock && (nextBlock.type === 'bulleted_list_item' || nextBlock.type === 'numbered_list_item')) {
            // 如果下一个是列表项，不添加段落
            return
          }
          htmlContent += `<p class="mb-8 text-gray-800 leading-[1.8] text-[17px]">${richText}</p>`
        } else {
          // 空段落作为间距
          htmlContent += `<div class="my-4"></div>`
        }
        break

      case 'heading_1':
        if (block.heading_1?.rich_text?.length > 0) {
          const richText = parseRichText(block.heading_1.rich_text)
          const plainText = block.heading_1.rich_text[0].plain_text
          const id = generateId(plainText)
          htmlContent += `<h1 id="${id}" class="group relative text-4xl font-bold text-gray-900 mb-8 mt-12 pt-4 border-t-2 border-gray-200 first:mt-0 first:border-t-0 first:pt-0">
            <a href="#${id}" class="absolute -left-8 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600">#</a>
            ${richText}
          </h1>`
        }
        break

      case 'heading_2':
        if (block.heading_2?.rich_text?.length > 0) {
          const richText = parseRichText(block.heading_2.rich_text)
          const plainText = block.heading_2.rich_text[0].plain_text
          const id = generateId(plainText)
          htmlContent += `<h2 id="${id}" class="group relative text-3xl font-bold text-gray-800 mb-6 mt-10 pb-2 border-b border-gray-200">
            <a href="#${id}" class="absolute -left-7 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600">#</a>
            ${richText}
          </h2>`
        }
        break

      case 'heading_3':
        if (block.heading_3?.rich_text?.length > 0) {
          const richText = parseRichText(block.heading_3.rich_text)
          const plainText = block.heading_3.rich_text[0].plain_text
          const id = generateId(plainText)
          htmlContent += `<h3 id="${id}" class="group relative text-2xl font-semibold text-gray-800 mb-4 mt-8">
            <a href="#${id}" class="absolute -left-6 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600">#</a>
            ${richText}
          </h3>`
        }
        break

      case 'bulleted_list_item':
        if (block.bulleted_list_item?.rich_text?.length > 0) {
          const richText = parseRichText(block.bulleted_list_item.rich_text)
          if (!inList || listType !== 'bulleted') {
            if (inList) htmlContent += '</ul>'
            htmlContent += '<ul class="list-disc list-outside ml-6 mb-6 space-y-2.5">'
            inList = true
            listType = 'bulleted'
          }
          htmlContent += `<li class="text-gray-800 leading-[1.8] text-[17px] pl-2">${richText}</li>`
        }
        break

      case 'numbered_list_item':
        if (block.numbered_list_item?.rich_text?.length > 0) {
          const richText = parseRichText(block.numbered_list_item.rich_text)
          if (!inList || listType !== 'numbered') {
            if (inList) htmlContent += '</ol>'
            htmlContent += '<ol class="list-decimal list-outside ml-6 mb-6 space-y-2.5">'
            inList = true
            listType = 'numbered'
          }
          htmlContent += `<li class="text-gray-800 leading-[1.8] text-[17px] pl-2">${richText}</li>`
        }
        break

      case 'code':
        if (block.code?.rich_text?.length > 0) {
          const code = block.code.rich_text.map(t => t.plain_text).join('')
          const language = block.code?.language || 'plaintext'

          // 转义HTML显示
          const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')

          // 使用 base64 编码存储代码，避免任何转义问题
          const base64Code = Buffer.from(code).toString('base64')

          htmlContent += `<div class="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-800">
            <div class="bg-gray-800 text-gray-300 px-4 py-2.5 flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wide">${language}</span>
              <button 
                type="button"
                data-code="${base64Code}"
                onclick="try{const code=atob(this.dataset.code);navigator.clipboard.writeText(code);const btn=this;const orig=btn.innerHTML;btn.innerHTML='<svg class=&quot;w-3.5 h-3.5 inline mr-1&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; viewBox=&quot;0 0 24 24&quot;><path stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; stroke-width=&quot;2&quot; d=&quot;M5 13l4 4L19 7&quot;></path></svg>已复制';setTimeout(function(){btn.innerHTML=orig},2000)}catch(e){console.error(e)}"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors cursor-pointer"
                title="点击复制代码"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span>复制</span>
              </button>
            </div>
            <pre class="bg-gray-950 text-gray-100 p-5 overflow-x-auto text-[14px] leading-[1.7] m-0"><code class="language-${language} font-mono">${escapedCode}</code></pre>
          </div>`
        }
        break

      case 'quote':
        if (block.quote?.rich_text?.length > 0) {
          const richText = parseRichText(block.quote.rich_text)
          htmlContent += `<blockquote class="border-l-4 border-blue-500 bg-blue-50/50 pl-6 pr-4 py-4 my-8 rounded-r-lg">
            <p class="text-gray-700 italic leading-[1.8] text-[17px]">${richText}</p>
          </blockquote>`
        }
        break

      case 'callout':
        if (block.callout?.rich_text?.length > 0) {
          const richText = parseRichText(block.callout.rich_text)
          const icon = block.callout.icon?.emoji || '💡'
          htmlContent += `<div class="bg-blue-50/80 border-l-4 border-blue-400 rounded-r-lg p-5 my-8 shadow-sm">
            <div class="flex items-start gap-3">
              <span class="text-2xl flex-shrink-0 mt-0.5">${icon}</span>
              <div class="text-gray-800 leading-[1.8] text-[17px] flex-1">${richText}</div>
            </div>
          </div>`
        }
        break

      case 'image':
        const imgUrl = block.image?.file?.url || block.image?.external?.url
        if (imgUrl) {
          const caption = block.image.caption?.[0]?.plain_text || ''
          htmlContent += `<figure class="my-10">
            <img src="${imgUrl}" alt="${caption}" class="w-full h-auto rounded-xl shadow-lg transition-transform hover:scale-[1.02] duration-300" loading="lazy" referrerPolicy="no-referrer" />
            ${caption ? `<figcaption class="text-center text-gray-500 text-sm mt-3">${caption}</figcaption>` : ''}
          </figure>`
        }
        break

      case 'bookmark':
        if (block.bookmark?.url) {
          const url = block.bookmark.url
          const caption = block.bookmark.caption?.[0]?.plain_text || ''

          // 从URL中提取域名
          let domain = ''
          try {
            const urlObj = new URL(url)
            domain = urlObj.hostname.replace('www.', '')
          } catch (e) {
            domain = url
          }

          htmlContent += `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block my-10 no-underline">
            <div class="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 bg-white group">
              <div class="flex items-start gap-4 p-5">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">${domain}</span>
                  </div>
                  <h3 class="text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                    ${caption || '查看链接'}
                  </h3>
                  <p class="text-sm text-gray-500 truncate">${url}</p>
                </div>
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </div>
              </div>
            </div>
          </a>`
        }
        break

      case 'embed':
        if (block.embed?.url) {
          const url = block.embed.url
          htmlContent += `<div class="my-10">
            <div class="relative w-full" style="padding-bottom: 56.25%;">
              <iframe src="${url}" class="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-md" allowfullscreen></iframe>
            </div>
          </div>`
        }
        break

      case 'video':
        if (block.video?.external?.url || block.video?.file?.url) {
          const videoUrl = block.video.external?.url || block.video.file?.url
          htmlContent += `<div class="my-10">
            <video controls class="w-full h-auto rounded-lg shadow-md">
              <source src="${videoUrl}" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
          </div>`
        }
        break

      case 'table_of_contents':
        htmlContent += `<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
          <h4 class="font-semibold text-gray-800 mb-2">目录</h4>
          <div class="text-sm text-gray-600">目录内容将根据页面标题自动生成</div>
        </div>`
        break

      case 'toggle':
        if (block.toggle?.rich_text?.length > 0) {
          const text = block.toggle.rich_text[0].plain_text
          htmlContent += `<details class="my-4"><summary class="cursor-pointer font-medium text-gray-900">${text}</summary><div class="mt-2 text-gray-700">点击展开查看详细内容</div></details>`
        }
        break

      case 'divider':
        htmlContent += `<hr class="my-6 border-gray-200" />`
        break

      default:
        // 对于其他类型的内容块，尝试提取文本
        if (block[block.type]?.rich_text?.length > 0) {
          const text = block[block.type].rich_text[0].plain_text
          htmlContent += `<p class="mb-8 text-gray-800 leading-[1.8] text-[17px]">${text}</p>`
        }
        break
    }
  })

  // 确保列表正确闭合
  if (inList) {
    if (listType === 'bulleted') {
      htmlContent += '</ul>'
    } else if (listType === 'numbered') {
      htmlContent += '</ol>'
    }
  }

  return htmlContent
}

/**
 * 获取页面的完整内容
 * @param {string} pageId - 页面ID
 * @returns {Promise<Object>} 包含HTML内容和原始块的对象
 */
export async function getFullPageContent(pageId) {
  try {
    // 检查缓存
    if (isContentCacheValid(pageId)) {
      console.log('✅ 使用缓存的文章内容，页面ID:', pageId)
      return contentCache.pages[pageId].data
    }

    console.log('🚀 开始获取完整页面内容，页面ID:', pageId)

    const blocks = await getPageContent(pageId)
    console.log('📦 获取到内容块:', blocks.length, '个')

    if (blocks.length > 0) {
      console.log('🔍 内容块类型分布:')
      const typeCount = {}
      blocks.forEach(block => {
        typeCount[block.type] = (typeCount[block.type] || 0) + 1
      })
      console.log(typeCount)
    }

    const htmlContent = parseContentBlocks(blocks)
    console.log('🎨 解析后的HTML内容长度:', htmlContent.length, '字符')

    const result = {
      htmlContent,
      blocks,
      hasContent: htmlContent.length > 0,
      blockCount: blocks.length,
      typeDistribution: blocks.reduce((acc, block) => {
        acc[block.type] = (acc[block.type] || 0) + 1
        return acc
      }, {})
    }

    console.log('✅ 完整页面内容获取完成:', result)

    // 设置缓存
    setContentCache(pageId, result)

    return result

  } catch (error) {
    console.error('❌ 获取完整页面内容失败:', error.message)
    console.error('错误详情:', error)

    return {
      htmlContent: '',
      blocks: [],
      hasContent: false,
      blockCount: 0,
      typeDistribution: {},
      error: error.message
    }
  }
}
