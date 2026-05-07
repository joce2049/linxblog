import { Client } from '@notionhq/client'
import { envConfig } from '@/config/site'

const notion = new Client({
  auth: envConfig.notion.apiKey,
})

// 内存缓存 - TTL 10 秒
const contentCache = {
  pages: {},
  ttl: 10 * 1000,
}

function isContentCacheValid(pageId) {
  const cached = contentCache.pages[pageId]
  if (!cached) return false
  return Date.now() - cached.timestamp < contentCache.ttl
}

function setContentCache(pageId, data) {
  contentCache.pages[pageId] = { data, timestamp: Date.now() }
}

/**
 * 递归获取某个块的所有子块（含分页 + 父子树形结构）
 * - 通过 while 循环消费 has_more / next_cursor，避免长文章被截断
 * - 子块挂在 block.children 上，渲染时递归保持层级
 */
async function getAllChildBlocks(blockId, depth = 0) {
  if (depth > 10) {
    console.warn('⚠️ 达到最大递归深度，停止获取', blockId)
    return []
  }

  const all = []
  let cursor = undefined
  let hasMore = true

  try {
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
        start_cursor: cursor,
      })

      for (const block of response.results || []) {
        const enriched = { ...block }
        if (block.has_children) {
          enriched.children = await getAllChildBlocks(block.id, depth + 1)
        } else {
          enriched.children = []
        }
        all.push(enriched)
      }

      hasMore = response.has_more
      cursor = response.next_cursor
    }
  } catch (error) {
    console.error(`❌ 获取块 ${blockId} 子内容失败:`, error.message)
  }

  return all
}

/**
 * 获取页面所有内容块（树形结构）
 */
export async function getPageContent(pageId) {
  try {
    if (!notion) {
      console.error('❌ Notion 客户端未初始化')
      return []
    }
    const blocks = await getAllChildBlocks(pageId)
    console.log('✅ 获取页面块数（含嵌套子块）:', countAllBlocks(blocks))
    return blocks
  } catch (error) {
    console.error('❌ 获取页面内容失败:', error.message)
    if (error.code === 'unauthorized') console.error('🔑 认证失败：请检查API密钥')
    if (error.code === 'object_not_found') console.error('🔍 页面未找到')
    if (error.code === 'rate_limited') console.error('⏱️ 请求频率限制')
    return []
  }
}

function countAllBlocks(blocks) {
  let count = 0
  for (const b of blocks) {
    count += 1
    if (b.children?.length) count += countAllBlocks(b.children)
  }
  return count
}

function escapeHtml(str) {
  if (str === undefined || str === null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(str) {
  return escapeHtml(str)
}

/**
 * 富文本 -> HTML（保持原有的视觉样式）
 */
function parseRichText(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) return ''

  return richTextArray
    .map((text) => {
      // 行内公式
      if (text.type === 'equation') {
        return `<code class="px-1.5 py-0.5 mx-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded text-sm font-mono">${escapeHtml(text.equation?.expression || '')}</code>`
      }

      let content = escapeHtml(text.plain_text)

      if (text.href) {
        content = `<a href="${escapeAttr(text.href)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline decoration-primary/60 hover:decoration-primary transition-colors">${content}</a>`
      } else {
        const a = text.annotations || {}
        if (a.bold) content = `<strong class="font-semibold text-foreground">${content}</strong>`
        if (a.italic) content = `<em class="italic">${content}</em>`
        if (a.strikethrough) content = `<del class="line-through text-muted-foreground">${content}</del>`
        if (a.underline) content = `<u class="underline decoration-muted-foreground/60">${content}</u>`
        if (a.code) content = `<code class="px-1.5 py-0.5 mx-0.5 bg-muted text-rose-600 dark:text-rose-400 rounded text-sm font-mono">${content}</code>`
      }

      return content
    })
    .join('')
}

function generateId(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w一-龥\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50)
}

/**
 * 渲染一组块（递归入口）。
 * 关键：连续的 list_item / to_do 需要被合并为同一个容器。
 */
function renderBlocks(blocks) {
  if (!blocks || blocks.length === 0) return ''

  let html = ''
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]

    if (block.type === 'bulleted_list_item') {
      const group = []
      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        group.push(blocks[i])
        i++
      }
      html += `<ul class="list-disc list-outside ml-6 mb-6 space-y-2.5">${group.map(renderListItem).join('')}</ul>`
      continue
    }
    if (block.type === 'numbered_list_item') {
      const group = []
      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        group.push(blocks[i])
        i++
      }
      html += `<ol class="list-decimal list-outside ml-6 mb-6 space-y-2.5">${group.map(renderListItem).join('')}</ol>`
      continue
    }
    if (block.type === 'to_do') {
      const group = []
      while (i < blocks.length && blocks[i].type === 'to_do') {
        group.push(blocks[i])
        i++
      }
      html += `<ul class="ml-2 mb-6 space-y-2.5">${group.map(renderTodoItem).join('')}</ul>`
      continue
    }

    // 表格行由父 table 块整体渲染
    if (block.type === 'table_row') {
      i++
      continue
    }

    html += renderSingleBlock(block)
    i++
  }
  return html
}

function renderListItem(block) {
  const data = block.bulleted_list_item || block.numbered_list_item
  if (!data) return ''
  const text = parseRichText(data.rich_text || [])
  const childHtml = block.children?.length ? renderBlocks(block.children) : ''
  return `<li class="text-foreground/85 leading-[1.8] text-[17px] pl-2">${text}${childHtml ? `<div class="mt-2">${childHtml}</div>` : ''}</li>`
}

function renderTodoItem(block) {
  const data = block.to_do
  if (!data) return ''
  const text = parseRichText(data.rich_text || [])
  const checked = data.checked
  const childHtml = block.children?.length ? renderBlocks(block.children) : ''
  return `<li class="flex items-start gap-2 text-foreground/85 leading-[1.8] text-[17px]">
    <span class="inline-flex items-center justify-center mt-1.5 w-4 h-4 rounded border ${checked ? 'bg-primary/100 border-primary text-white' : 'border-border bg-card'}" aria-hidden="true">${checked ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}</span>
    <div class="flex-1 ${checked ? 'line-through text-muted-foreground' : ''}">${text}${childHtml ? `<div class="mt-2">${childHtml}</div>` : ''}</div>
  </li>`
}

function renderSingleBlock(block) {
  switch (block.type) {
    case 'paragraph': {
      const text = parseRichText(block.paragraph?.rich_text || [])
      const childHtml = block.children?.length ? renderBlocks(block.children) : ''
      if (!text && !childHtml) return `<div class="my-4"></div>`
      return `<p class="mb-8 text-foreground/85 leading-[1.8] text-[17px]">${text}</p>${childHtml}`
    }

    case 'heading_1': {
      const rich = block.heading_1?.rich_text || []
      if (!rich.length) return ''
      const text = parseRichText(rich)
      const plain = rich.map((t) => t.plain_text).join('')
      const id = generateId(plain)
      return `<h1 id="${id}" class="group relative text-4xl font-bold text-foreground mb-8 mt-12 pt-4 border-t-2 border-border first:mt-0 first:border-t-0 first:pt-0">
        <a href="#${id}" class="absolute -left-8 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/70 hover:text-primary">#</a>
        ${text}
      </h1>`
    }
    case 'heading_2': {
      const rich = block.heading_2?.rich_text || []
      if (!rich.length) return ''
      const text = parseRichText(rich)
      const plain = rich.map((t) => t.plain_text).join('')
      const id = generateId(plain)
      return `<h2 id="${id}" class="group relative text-3xl font-bold text-foreground/85 mb-6 mt-10 pb-2 border-b border-border">
        <a href="#${id}" class="absolute -left-7 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/70 hover:text-primary">#</a>
        ${text}
      </h2>`
    }
    case 'heading_3': {
      const rich = block.heading_3?.rich_text || []
      if (!rich.length) return ''
      const text = parseRichText(rich)
      const plain = rich.map((t) => t.plain_text).join('')
      const id = generateId(plain)
      return `<h3 id="${id}" class="group relative text-2xl font-semibold text-foreground/85 mb-4 mt-8">
        <a href="#${id}" class="absolute -left-6 pr-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/70 hover:text-primary">#</a>
        ${text}
      </h3>`
    }

    case 'code': {
      const data = block.code || {}
      const code = (data.rich_text || []).map((t) => t.plain_text).join('')
      const language = data.language || 'plaintext'
      const escapedCode = escapeHtml(code)
      const base64Code = Buffer.from(code, 'utf8').toString('base64')

      return `<div class="my-8 rounded-lg overflow-hidden border border-gray-800">
        <div class="bg-gray-800 text-gray-300 px-4 py-2.5 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide">${escapeHtml(language)}</span>
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
        <pre class="bg-gray-950 text-gray-100 p-5 overflow-x-auto text-[14px] leading-[1.7] m-0"><code class="language-${escapeHtml(language)} font-mono">${escapedCode}</code></pre>
      </div>`
    }

    case 'quote': {
      const text = parseRichText(block.quote?.rich_text || [])
      const childHtml = block.children?.length ? renderBlocks(block.children) : ''
      return `<blockquote class="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 pl-6 pr-4 py-4 my-8 rounded-r-lg">
        <p class="text-foreground/80 italic leading-[1.8] text-[17px]">${text}</p>
        ${childHtml ? `<div class="mt-3 text-foreground/80">${childHtml}</div>` : ''}
      </blockquote>`
    }

    case 'callout': {
      const data = block.callout || {}
      const text = parseRichText(data.rich_text || [])
      const icon = data.icon?.emoji || '💡'
      const childHtml = block.children?.length ? renderBlocks(block.children) : ''
      return `<div class="bg-primary/10 border-l-4 border-primary/60 rounded-r-lg p-5 my-8 ">
        <div class="flex items-start gap-3">
          <span class="text-2xl flex-shrink-0 mt-0.5">${escapeHtml(icon)}</span>
          <div class="text-foreground/85 leading-[1.8] text-[17px] flex-1">
            <p>${text}</p>
            ${childHtml ? `<div class="mt-2">${childHtml}</div>` : ''}
          </div>
        </div>
      </div>`
    }

    case 'image': {
      const data = block.image || {}
      const url = data.file?.url || data.external?.url
      if (!url) return ''
      const caption = (data.caption || []).map((c) => c.plain_text).join('')
      return `<figure class="my-10">
        <img src="${escapeAttr(url)}" alt="${escapeAttr(caption)}" class="w-full h-auto rounded-xl transition-transform hover:scale-[1.02] duration-300" loading="lazy" referrerPolicy="no-referrer" />
        ${caption ? `<figcaption class="text-center text-muted-foreground text-sm mt-3">${escapeHtml(caption)}</figcaption>` : ''}
      </figure>`
    }

    case 'video': {
      const data = block.video || {}
      const url = data.external?.url || data.file?.url
      if (!url) return ''
      if (data.type === 'external' || /youtube|youtu\.be|bilibili|vimeo/.test(url)) {
        return `<div class="my-10">
          <div class="relative w-full" style="padding-bottom: 56.25%;">
            <iframe src="${escapeAttr(toEmbedUrl(url))}" class="absolute top-0 left-0 w-full h-full border-0 rounded-lg " allowfullscreen></iframe>
          </div>
        </div>`
      }
      return `<div class="my-10">
        <video controls class="w-full h-auto rounded-lg ">
          <source src="${escapeAttr(url)}" type="video/mp4">
          您的浏览器不支持视频播放。
        </video>
      </div>`
    }

    case 'embed': {
      const url = block.embed?.url
      if (!url) return ''
      return `<div class="my-10">
        <div class="relative w-full" style="padding-bottom: 56.25%;">
          <iframe src="${escapeAttr(url)}" class="absolute top-0 left-0 w-full h-full border-0 rounded-lg " allowfullscreen></iframe>
        </div>
      </div>`
    }

    case 'bookmark':
    case 'link_preview': {
      const url = block.bookmark?.url || block.link_preview?.url
      if (!url) return ''
      const caption = (block.bookmark?.caption?.[0]?.plain_text) || ''
      let domain = ''
      try {
        domain = new URL(url).hostname.replace(/^www\./, '')
      } catch {
        domain = url
      }

      return `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="block my-10 no-underline">
        <div class="border border-border rounded-xl overflow-hidden hover:border-primary/60 transition-all duration-300 bg-card group">
          <div class="flex items-start gap-4 p-5">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <span class="text-xs font-medium text-muted-foreground uppercase tracking-wide">${escapeHtml(domain)}</span>
              </div>
              <h3 class="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                ${escapeHtml(caption || '查看链接')}
              </h3>
              <p class="text-sm text-muted-foreground truncate">${escapeHtml(url)}</p>
            </div>
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-muted-foreground/70 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </div>
          </div>
        </div>
      </a>`
    }

    case 'file': {
      const data = block.file || {}
      const url = data.file?.url || data.external?.url
      if (!url) return ''
      const name = (data.caption?.[0]?.plain_text) || data.name || '附件'
      return `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 my-4 bg-muted/40 hover:bg-accent border border-border hover:border-primary/40 rounded-lg text-foreground/85 hover:text-primary/80 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
        <span class="text-sm">${escapeHtml(name)}</span>
      </a>`
    }

    case 'pdf': {
      const data = block.pdf || {}
      const url = data.file?.url || data.external?.url
      if (!url) return ''
      return `<div class="my-8">
        <iframe src="${escapeAttr(url)}" class="w-full rounded-lg border border-border " style="height: 600px;"></iframe>
      </div>`
    }

    case 'equation': {
      const expr = block.equation?.expression || ''
      return `<div class="my-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center font-mono text-amber-900 dark:text-amber-300">${escapeHtml(expr)}</div>`
    }

    case 'divider':
      return `<hr class="my-6 border-border" />`

    case 'toggle': {
      const data = block.toggle || {}
      const text = parseRichText(data.rich_text || [])
      const childHtml = block.children?.length ? renderBlocks(block.children) : ''
      return `<details class="my-4 border border-border rounded-lg overflow-hidden">
        <summary class="cursor-pointer font-medium text-foreground px-4 py-3 hover:bg-muted/40 select-none">${text}</summary>
        <div class="px-4 py-3 border-t border-border bg-muted/40/40 text-foreground/80">${childHtml || '<p class="text-muted-foreground italic">（无内容）</p>'}</div>
      </details>`
    }

    case 'column_list': {
      const cols = (block.children || []).filter((c) => c.type === 'column')
      if (cols.length === 0) return ''
      const colClass = cols.length === 2 ? 'md:grid-cols-2' : cols.length === 3 ? 'md:grid-cols-3' : cols.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2'
      return `<div class="grid grid-cols-1 ${colClass} gap-6 my-6">${cols
        .map((col) => `<div class="space-y-2">${renderBlocks(col.children || [])}</div>`)
        .join('')}</div>`
    }

    case 'column':
      // 落单 column 直接渲染其子内容
      return `<div>${renderBlocks(block.children || [])}</div>`

    case 'table': {
      const data = block.table || {}
      const hasColHeader = data.has_column_header
      const hasRowHeader = data.has_row_header
      const rows = (block.children || []).filter((c) => c.type === 'table_row')
      if (rows.length === 0) return ''

      const renderRow = (row, idx) => {
        const cells = row.table_row?.cells || []
        const isHeaderRow = hasColHeader && idx === 0
        return `<tr>${cells
          .map((cell, ci) => {
            const html = parseRichText(cell)
            const isHeaderCell = isHeaderRow || (hasRowHeader && ci === 0)
            const tag = isHeaderCell ? 'th' : 'td'
            const cls = isHeaderRow
              ? 'px-4 py-2 bg-muted text-foreground font-semibold text-left border border-border'
              : isHeaderCell
                ? 'px-4 py-2 bg-muted/40 text-foreground/85 font-semibold text-left border border-border'
                : 'px-4 py-2 text-foreground/80 border border-border align-top'
            return `<${tag} class="${cls}">${html}</${tag}>`
          })
          .join('')}</tr>`
      }

      const headerRow = hasColHeader ? `<thead>${renderRow(rows[0], 0)}</thead>` : ''
      const bodyRows = (hasColHeader ? rows.slice(1) : rows).map((r, i) => renderRow(r, hasColHeader ? i + 1 : i)).join('')

      return `<div class="my-8 overflow-x-auto">
        <table class="min-w-full text-sm border-collapse border border-border rounded-lg">
          ${headerRow}
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`
    }

    case 'child_page': {
      const title = block.child_page?.title || '子页面'
      return `<div class="my-4 px-4 py-3 bg-muted/40 border-l-4 border-primary/60 rounded-r-lg text-foreground/85">📄 ${escapeHtml(title)}</div>`
    }

    case 'child_database': {
      const title = block.child_database?.title || '子数据库'
      return `<div class="my-4 px-4 py-3 bg-muted/40 border-l-4 border-purple-400 rounded-r-lg text-foreground/85">🗂 ${escapeHtml(title)}</div>`
    }

    case 'synced_block':
      return renderBlocks(block.children || [])

    case 'table_of_contents':
      return `<div class="bg-muted/40 border border-border rounded-lg p-4 my-4">
        <h4 class="font-semibold text-foreground/85 mb-2">目录</h4>
        <div class="text-sm text-muted-foreground">目录内容将根据页面标题自动生成</div>
      </div>`

    case 'breadcrumb':
      return ''

    case 'link_to_page':
      return `<div class="my-4 px-4 py-3 bg-muted/40 border-l-4 border-primary/60 rounded-r-lg text-foreground/85">🔗 链接到页面</div>`

    default: {
      // 兜底：尝试取 rich_text
      const rt = block[block.type]?.rich_text
      if (rt?.length) {
        return `<p class="mb-8 text-foreground/85 leading-[1.8] text-[17px]">${parseRichText(rt)}</p>`
      }
      return ''
    }
  }
}

/**
 * YouTube/B站 watch URL 转 embed URL
 */
function toEmbedUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    }
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed${u.pathname}`
    }
    if (u.hostname.includes('bilibili.com') && u.pathname.includes('/video/')) {
      const bvid = u.pathname.split('/video/')[1]?.split('/')[0]
      if (bvid) return `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`
    }
  } catch {}
  return url
}

/**
 * 兼容旧导出名称
 */
export function parseContentBlocks(blocks) {
  return renderBlocks(blocks || [])
}

/**
 * 入口：拿到完整页面内容
 */
export async function getFullPageContent(pageId) {
  try {
    if (isContentCacheValid(pageId)) {
      console.log('✅ 使用缓存的文章内容，页面ID:', pageId)
      return contentCache.pages[pageId].data
    }

    console.log('🚀 开始获取完整页面内容，页面ID:', pageId)
    const blocks = await getPageContent(pageId)
    console.log('📦 获取到内容块（含嵌套）:', countAllBlocks(blocks), '个')

    const htmlContent = renderBlocks(blocks)
    console.log('🎨 解析后的HTML内容长度:', htmlContent.length, '字符')

    const result = {
      htmlContent,
      blocks,
      hasContent: htmlContent.length > 0,
      blockCount: countAllBlocks(blocks),
      typeDistribution: blocks.reduce((acc, b) => {
        acc[b.type] = (acc[b.type] || 0) + 1
        return acc
      }, {}),
    }

    setContentCache(pageId, result)
    return result
  } catch (error) {
    console.error('❌ 获取完整页面内容失败:', error.message)
    return {
      htmlContent: '',
      blocks: [],
      hasContent: false,
      blockCount: 0,
      typeDistribution: {},
      error: error.message,
    }
  }
}
