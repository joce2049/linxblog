/**
 * 稳定媒体代理 URL 生成器
 *
 * Notion 的图片/文件都是 1 小时过期的 S3 预签名直链，一旦被烘焙进缓存的 HTML
 * （ISR / unstable_cache / Router Cache / prefetch）就会在过期后 403 裂开。
 *
 * 这里把会过期的 S3 直链换成一个**永不变**的站内 URL；浏览器请求它时，
 * /api/media 会在服务端实时解析出新鲜 S3 URL 并 302 重定向过去。
 * 稳定 URL 让缓存的 HTML 存多久都不会失效 —— 图片/媒体永不裂开。
 *
 * `version` 用页面/块的 last_edited_time：内容变更时 URL 随之变化，
 * 使 Vercel 边缘缓存自然失效、拉取新图。
 */

function buildUrl(param, id, version) {
  if (!id) return ''
  const v = version ? `&v=${encodeURIComponent(version)}` : ''
  return `/api/media?${param}=${encodeURIComponent(id)}${v}`
}

/** 封面图（Notion 页面「封面」属性）→ 稳定代理 URL */
export function coverMediaUrl(pageId, version) {
  return buildUrl('page', pageId, version)
}

/** 正文块内的媒体（image/video/audio/file/pdf 块）→ 稳定代理 URL */
export function blockMediaUrl(blockId, version) {
  return buildUrl('block', blockId, version)
}

// 只有 Notion 托管的 S3 预签名直链会过期、需要走代理；本地图（/xxx.png）与外链图（Unsplash 等）不过期，直接用
const S3_HOST = 'amazonaws.com'

/**
 * 决定封面图该用的 src。
 * @param {string|null|undefined} image 数据里的原始封面 URL（S3 直链 / 外链 / 本地路径）
 * @param {string} pageId Notion 页面 ID
 * @param {string} [version] last_edited_time，用于缓存失效
 */
export function coverSrc(image, pageId, version) {
  if (image && image.includes(S3_HOST)) return coverMediaUrl(pageId, version)
  return image || ''
}

