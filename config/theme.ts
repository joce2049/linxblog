/**
 * 主题配色配置 — 单一信源
 *
 * 修改本文件后保存，刷新浏览器即可看到效果（无需重启 dev server）。
 * 通过 components/ThemeStyleInjector.tsx 在 <head> 注入 CSS 变量，SSR 就位。
 *
 * 颜色格式说明：
 *   - shadcn token：HSL 三元组字符串，空格分隔，不带 hsl() 包裹
 *     例：'215 19% 35%' → 渲染为 hsl(215 19% 35%) → #475569
 *   - brandAccent：完整 hex 字符串
 *     例：'#475569'
 *   - gradient*：完整 CSS gradient 字符串
 *     例：'linear-gradient(135deg, #1E293B 0%, #475569 55%, #64748B 100%)'
 *   - highlightLine*：完整 CSS gradient 字符串（用于 1px 金属高光）
 *
 * HSL ↔ hex 速查（slate 家族，本主题主用）：
 *   slate-50  '210 40% 98%'  #F8FAFC
 *   slate-100 '210 40% 96%'  #F1F5F9
 *   slate-200 '214 32% 91%'  #E2E8F0
 *   slate-300 '213 27% 84%'  #CBD5E1
 *   slate-400 '215 20% 65%'  #94A3B8
 *   slate-500 '215 16% 47%'  #64748B
 *   slate-600 '215 19% 35%'  #475569
 *   slate-700 '215 25% 27%'  #334155
 *   slate-800 '217 33% 17%'  #1E293B
 *   slate-900 '222 47% 11%'  #0F172A
 */

/** 主题色板 — 一套主题所需的所有 token */
export interface ThemeColors {
  /* === shadcn 核心 token（HSL 三元组字符串）=== */
  /** 页面底色 */
  background: string
  /** 主文字 */
  foreground: string
  /** 卡片底色 */
  card: string
  cardForeground: string
  /** 弹层底色（dropdown / popover / dialog） */
  popover: string
  popoverForeground: string
  /** 主色 — 按钮、链接、focus、强调 */
  primary: string
  /** 主色上的文字（白底蓝字按钮中的"白"） */
  primaryForeground: string
  /** 次要按钮、次级背景 */
  secondary: string
  secondaryForeground: string
  /** 弱化背景（占位、骨架） */
  muted: string
  /** 次级文字（描述、元数据） */
  mutedForeground: string
  /** hover 时的背景 */
  accent: string
  accentForeground: string
  /** 错误/危险（删除按钮） */
  destructive: string
  destructiveForeground: string
  /** 边框、分隔线 */
  border: string
  /** input 边框 */
  input: string
  /** focus ring */
  ring: string

  /* === 次强调色（装饰用，非状态色）=== */
  /** 暖金 amber 强调色（文字、icon、1px 强调线） */
  accentWarm: string
  /** 暖金强调色的实色背景（小 badge / 小标签底色） */
  accentWarmBg: string

  /* === 选中文本高亮（::selection）=== */
  /** 文本选中时的背景 hex */
  brandAccent: string

  /* === 渐变 — 完整 CSS gradient 字符串 === */
  /** 主品牌渐变（logo 块、CTA 按钮） */
  gradientBrand: string
  /** 5-stop 反光铂金（大块装饰用） */
  gradientPlatinum: string
  /** 文字版铂金渐变（大标题、网站名） */
  gradientPlatinumText: string
  /** 中浅铂金（border-gradient） */
  gradientTech: string
  /** 阅读进度条渐变 */
  gradientProgress: string

  /* === 1px 金属高光线（card-hover 顶边等）=== */
  /** 高亮版（hover 时） */
  highlightLine: string
  /** 弱化版（静态分隔线） */
  highlightLineSoft: string
}

/* ============================================================
 *  亮色主题 — Light Theme
 *  铂金白底 + 冷灰主色（slate-600）
 * ============================================================ */
export const lightTheme: ThemeColors = {
  background: '210 20% 97%',          // #F5F7FA 铂金白
  foreground: '222 47% 11%',          // #0F172A slate-900
  card: '0 0% 100%',                  // #FFFFFF
  cardForeground: '222 47% 11%',
  popover: '0 0% 100%',
  popoverForeground: '222 47% 11%',
  primary: '215 19% 35%',             // #475569 slate-600（饱和度 19%）
  primaryForeground: '0 0% 100%',
  secondary: '210 40% 95%',           // slate-100
  secondaryForeground: '222 47% 11%',
  muted: '214 32% 91%',               // #E2E8F0 slate-200
  mutedForeground: '215 16% 47%',     // #64748B slate-500
  accent: '210 40% 95%',
  accentForeground: '222 47% 11%',
  destructive: '0 70% 45%',
  destructiveForeground: '0 0% 98%',
  border: '214 32% 91%',              // slate-200
  input: '214 32% 91%',
  ring: '215 16% 47%',                // slate-500

  accentWarm: '32 95% 37%',           // #B45309 amber-700（文字 / icon / 1px 强调线）
  accentWarmBg: '48 96% 89%',         // #FEF3C7 amber-100（小 badge 实色背景）

  brandAccent: '#475569',             // 选中文本背景

  gradientBrand: 'linear-gradient(135deg, #1E293B 0%, #475569 55%, #64748B 100%)',
  gradientPlatinum: 'linear-gradient(135deg, #64748B 0%, #94A3B8 30%, #E2E8F0 50%, #94A3B8 70%, #475569 100%)',
  gradientPlatinumText: 'linear-gradient(135deg, #0F172A 0%, #334155 50%, #64748B 100%)',
  gradientTech: 'linear-gradient(135deg, #475569 0%, #94A3B8 50%, #CBD5E1 100%)',
  gradientProgress: 'linear-gradient(to right, #CBD5E1, #94A3B8, #475569)',

  highlightLine: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.55) 50%, transparent 100%)',
  highlightLineSoft: 'linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.4) 50%, transparent 100%)',
}

/* ============================================================
 *  暗色主题 — Dark Theme
 *  黑曜石黑底 + 铂金主色（slate-400）
 *  与亮色完全独立 —— 改一边不影响另一边
 * ============================================================ */
export const darkTheme: ThemeColors = {
  background: '222 39% 8%',           // #0B0F19 黑曜石黑
  foreground: '213 27% 84%',          // #C9D5E3
  card: '222 32% 12%',                // #131A2A
  cardForeground: '213 27% 84%',
  popover: '222 32% 12%',
  popoverForeground: '213 27% 84%',
  primary: '215 20% 65%',             // #94A3B8 slate-400
  primaryForeground: '222 39% 8%',
  secondary: '217 33% 17%',           // #1E293B slate-800
  secondaryForeground: '213 27% 84%',
  muted: '217 33% 17%',
  mutedForeground: '215 20% 65%',     // slate-400
  accent: '217 33% 20%',
  accentForeground: '213 27% 84%',
  destructive: '0 60% 50%',
  destructiveForeground: '0 0% 98%',
  border: '217 33% 18%',              // slate-800
  input: '217 33% 18%',
  ring: '215 20% 65%',                // slate-400

  accentWarm: '38 92% 50%',           // #F59E0B amber-500（暗色版强调）
  accentWarmBg: '22 89% 14%',         // #451A03 amber-950（暗色版小 badge 底色）

  brandAccent: '#94A3B8',

  gradientBrand: 'linear-gradient(135deg, #1E293B 0%, #475569 55%, #94A3B8 100%)',
  gradientPlatinum: 'linear-gradient(135deg, #475569 0%, #94A3B8 30%, #F1F5F9 50%, #94A3B8 70%, #334155 100%)',
  gradientPlatinumText: 'linear-gradient(135deg, #CBD5E1 0%, #94A3B8 50%, #64748B 100%)',
  gradientTech: 'linear-gradient(135deg, #475569 0%, #94A3B8 50%, #CBD5E1 100%)',
  gradientProgress: 'linear-gradient(to right, #475569, #94A3B8, #CBD5E1)',

  highlightLine: 'linear-gradient(90deg, transparent 0%, rgba(203, 213, 225, 0.5) 50%, transparent 100%)',
  highlightLineSoft: 'linear-gradient(90deg, transparent 0%, rgba(203, 213, 225, 0.35) 50%, transparent 100%)',
}
