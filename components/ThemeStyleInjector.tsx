import { lightTheme, darkTheme, type ThemeColors } from '@/config/theme'

/**
 * ThemeStyleInjector — 把 config/theme.ts 转为 CSS 变量并注入 <head>
 *
 * Server Component，只在 SSR 阶段渲染一次到 HTML 头部，
 * 保证首屏渲染前 CSS 变量已就位（避免主题闪屏 / FOUC）。
 *
 * 切换暗色：next-themes 在 <html> 上加 .dark class，
 * `.dark { ... }` 中的变量自动覆盖 :root，与 ThemeProvider 联动。
 */

const camelToKebab = (s: string): string =>
  s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const colorsToCssVars = (colors: ThemeColors): string =>
  Object.entries(colors)
    .map(([key, value]) => `--${camelToKebab(key)}: ${value};`)
    .join('\n  ')

export default function ThemeStyleInjector() {
  const css = `:root {
  ${colorsToCssVars(lightTheme)}
}
.dark {
  ${colorsToCssVars(darkTheme)}
}`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
