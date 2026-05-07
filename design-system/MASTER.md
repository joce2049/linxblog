# Design System Master File

> **LinX 后期工坊 · 设计规范 — 唯一信源**
> 最后更新：2026-05-07
> 由 ui-ux-pro-max 模板与项目实战决策合并而成

---

## 文档使用逻辑

> 当为某个具体页面构建 UI 时，**先**查看 `design-system/pages/[page-name].md`。
> 若该文件存在，其规则**覆盖**本 Master 文件。
> 若不存在，严格遵循本文件以下规则。

本文档是网站视觉设计的**唯一信源**。改动 UI 前先读这里；新增决策也写在这里。文档采用「规则 + 反例 + 锚点代码」的格式，让你和未来的 Claude 都能快速对齐。

---

## 设计理念

| 关键词 | 含义 |
|--------|------|
| **科技铂金** | 主色冷灰（slate-600 / slate-400），渐变走铂金（slate 系内部反光），低饱和度（≤19%）。Linear graphite / Tesla 仪表盘 / B&O 那种工业金属感 |
| **精致锐利** | 字号克制、间距严谨、对比鲜明。不靠装饰,靠秩序赢 |
| **扁平为主 + 1px 高光** | 默认无 shadow；hover 状态允许 1px 渐变高光线作为「金属反光」点缀 |
| **明暗同等** | 双向都是一等公民。任何新组件必须同时通过两套主题验证。亮色铂金白底 + slate-600 主色 / 暗色黑曜石 + slate-400 主色 |

> **拒绝清单**：紫色（violet/purple）、粉色装饰（pink/rose 仅做错误状态色）、Inter + 蓝紫的「AI 默认审美」、卡片下方 `box-shadow` 表达层级、彩色渐变 hero、emoji 当装饰元素、**高饱和电光蓝/天蓝（sky/cyan）**作为主色

---

## 1. 颜色系统

### 1.1 单一信源

所有颜色统一通过 [config/theme.ts](config/theme.ts) 的 `lightTheme` / `darkTheme` 两个对象定义。
[components/ThemeStyleInjector.tsx](components/ThemeStyleInjector.tsx) 在 SSR 阶段把这两个对象转为 CSS 变量,注入到 `<head>` 的 `:root { ... }` 与 `.dark { ... }` 块中。
[app/globals.css](app/globals.css) 不再硬编码颜色 token（仅保留 `--radius` / 字体变量等非主题相关项）。

**修改配色：**编辑 `config/theme.ts`,浏览器刷新即生效（无需重启 dev server）。亮、暗两套主题完全独立,互不影响。

**禁止**在组件里写 hex / rgb / `text-blue-600` / `text-violet-*` 之类的 Tailwind 调色板原色。

正确：
```tsx
<p className="text-foreground/85">正文</p>
<div className="bg-card border border-border" />
<a className="text-primary hover:text-primary/80">链接</a>
```

错误：
```tsx
<p className="text-gray-800">正文</p>          // ✗ 不响应主题切换
<a className="text-blue-500">链接</a>          // ✗ 与 token 系统脱节
<div className="bg-violet-500/15" />          // ✗ 紫色已被弃用
```

### 1.2 调色板（亮 / 暗）

| Token | 亮色 hex | 暗色 hex | 用途 |
|-------|----------|----------|------|
| `--background` | `#F5F7FA` | `#0B0F19` | 页面底色（铂金白 / 黑曜石黑） |
| `--foreground` | `#0F172A` | `#E2E8F0` | 主文字（slate-900 / slate-200） |
| `--card` | `#FFFFFF` | `#131A2A` | 卡片底色 |
| `--border` | `#E2E8F0` | `#1E293B` | 边框、分隔线（slate-200 / slate-800） |
| `--primary` | `#475569` | `#94A3B8` | **核心冷灰**（按钮 / 链接 / focus / 强调,slate-600 / slate-400） |
| `--ring` | `#64748B` | `#94A3B8` | focus ring（slate-500 / slate-400） |
| `--muted` | `#E2E8F0` | `#1E293B` | 次级背景 |
| `--muted-foreground` | `#64748B` | `#94A3B8` | 次级文字（slate-500 / slate-400） |
| `--accent` | `#EEF2F7` | `#1E293B` | hover 时的背景 |

> **饱和度限制**：所有 token 饱和度 ≤19%（slate 家族特征）。任何新增装饰色不得高于 30%（emerald/amber 状态色除外）。

### 1.3 文字颜色梯度

| Tailwind 类 | 用法 |
|-------------|------|
| `text-foreground` | 标题、强调文字 |
| `text-foreground/85` | **正文段落**（主体阅读） |
| `text-foreground/80` | 次级正文、按钮文字 |
| `text-muted-foreground` | 描述、元数据、辅助说明 |
| `text-muted-foreground/70` | 占位符、最弱的提示 |
| `text-primary` | 链接、可点击强调（**冷灰 slate-600 / slate-400**） |

> **规则**：层级从 100% → 70% 之间用透明度过渡,**不要再加新的灰度层级**。

### 1.4 状态色

| 用途 | Tailwind 写法 | 备注 |
|------|--------------|------|
| 成功 | `text-emerald-600 dark:text-emerald-400` + `bg-emerald-500/15` | 已切换状态 |
| 警告 | `text-amber-600 dark:text-amber-400` + `bg-amber-500/15` | 公告、提醒 |
| 错误 | `text-rose-600 dark:text-rose-400` + `bg-destructive` | 删除、报错 |
| 信息 | `text-primary` + `bg-primary/10` | 中性提示（默认冷灰） |

> **规则**：所有装饰彩色必须**显式声明 dark 变体**。`bg-X-500/15` 这种半透明覆盖不需要 dark 变体（透明度自动适配）。
> **多档色阶**（如 tags 热度等级）：用 `bg-primary/20` → `bg-primary/10` 两档表达 top-2,再切换到 emerald/amber/muted。**不要引入 sky/cyan 作为额外色阶**（违背低饱和原则）。

### 1.5 品牌渐变

仅以下封装好的 utility class 可使用渐变（不要复制 hex 到组件）：

| Class / Token | 用途 | 视觉 |
|-------|------|------|
| `.brand-logo-mark` | Logo 圆形/方形色块（L 字头） | 深 slate → 中 slate → 浅 slate（铂金渐变）+ 内层 45° 半透白斜光 |
| `.brand-logo-text` | 网站名文字渐变 | 深 slate → 中 slate → 次中 slate（铂金光泽） |
| `.gradient-bg` (= `--gradient-brand`) | 主 CTA 按钮（仅 404 等极少处） | 同 logo-mark |
| `.text-gradient` | 大标题文字渐变 | 同 logo-text |
| `--gradient-platinum` | 铂金 5-stop 反光渐变（slate-500→200→500） | 中→白→中（金属反光感） |
| `--gradient-tech` | 同义铂金浅亮渐变 | slate-600 → slate-400 → slate-300 |
| `--gradient-progress` | 阅读进度条（铂金浅→深过渡） | 仅 ReadingProgressBar 用 |
| `--highlight-line` | 1px 铂金高光线 | 用于 card hover 顶边、metallic-edge |

> **拒绝**：在卡片背景、Hero 大块、分类徽章上铺渐变；在组件里手写 `bg-gradient-to-br from-X to-Y`；任何渐变中出现 sky/cyan/blue 等高饱和色（slate 系内部 OK）。

### 1.6 次强调色（Amber Accent）

「科技铂金」的克制不等于贫色。本节定义**唯一一个**装饰强调色——暖金 amber,作为「墨青琥珀」配色方案的点睛之笔。NYT / Bloomberg / 高端报刊风。

#### Token

| Token | 亮色 hex | 暗色 hex | CSS 变量 |
|-------|----------|----------|---------|
| `accentWarm` | `#B45309` (amber-700) | `#F59E0B` (amber-500) | `--accent-warm` |
| `accentWarmBg` | `#FEF3C7` (amber-100) | `#451A03` (amber-950) | `--accent-warm-bg` |

定义在 [config/theme.ts](config/theme.ts),由 [ThemeStyleInjector](components/ThemeStyleInjector.tsx) 自动注入为 CSS 变量。

#### Utility 类（首选）

定义在 [app/globals.css](app/globals.css)：

| Class | 视觉 | 使用场景 |
|-------|------|---------|
| `.badge-warm` | 实色 amber-100 底 + amber-700 字 + 1px 边 | 「精选/置顶/编辑推荐」小徽章 |
| `.badge-warm-soft` | 半透明 amber/12 底 + amber-700 字 | 文章卡 tag 的 top-1 热度档 |
| `.text-warm` | 仅 amber 文字色 | 章节序号、关键数字强调 |
| `.underline-warm` | 1px 暖金底边 | 标题底部点缀 |

#### Tailwind 直接调用（次选）

```tsx
<span className="text-accent-warm">高亮文字</span>
<div className="bg-accent-warm-bg">浅金底色</div>
<div className="bg-accent-warm/12">半透明底</div>
```

#### 与状态色 amber-warning 的区分（**关键**）

| 维度 | 状态色（warning） | 装饰色（accent） |
|------|------------------|----------------|
| Hex 亮 | `#D97706` (amber-600) | `#B45309` (amber-700) |
| 使用前提 | **必须配 icon**（ShieldAlert / AlertTriangle 等） | 无 icon 也成立 |
| 应用形式 | 实色 / 半透 bg + 标题 + 描述（公告横幅） | 小 badge / 短文字 / 1px 线 |
| 出现频率 | 仅遇到警告时 | 静态 UI 常驻（精选标识等） |
| 面积上限 | 必要范围（横幅可大） | **单页累计 ≤ 2%** |

> **判断规则**：脱离「警告/提醒」语义就用 `.badge-warm`（amber-700）；带警告语义则用 `bg-amber-500/15 text-amber-600 dark:text-amber-400`（保留 §1.4 状态色写法）。两者**永不同屏出现**。

#### 反例

- ❌ 用 `.badge-warm` 表达「警告/错误」（混淆语义,这是状态色 §1.4 的领地）
- ❌ 在 hero / 首屏大块背景上用 `bg-accent-warm-bg`（违反"≤ 2% 面积"红线）
- ❌ 在导航栏 link、CTA 主按钮上用 amber（这些位置属于 primary）
- ❌ 把 amber 加进 `gradientBrand`（不引入双金属渐变,本方案是「点睛之笔」不是「金属感升级」）
- ❌ 引入第二个装饰色相（如 emerald-800、indigo-900）—— **amber 是唯一装饰强调色**

---

## 2. 字体系统

### 2.1 字体栈

```css
/* tailwind.config.ts */
sans: 'var(--font-inter)', system-ui, sans-serif    /* 默认正文 */
mono: 'var(--font-jetbrains-mono)', monospace       /* 代码、技术信息 */
```

字体由 [app/layout.tsx](app/layout.tsx) 通过 `next/font/google` 自托管加载,避免外部依赖与 FOUC。

> **规则**：暂不引入第三方字体。如未来要加 display 字体（标题用）,评估包体积,优先选 OFL/SIL 协议。

### 2.2 字号阶梯

实测使用频率排序（top 6 占 80% 用量）：

| Tailwind 类 | 像素 | 主要用途 |
|-------------|------|----------|
| `text-xs` (12px) | 12 | 元数据、版权、tag 计数 |
| `text-sm` (14px) | 14 | **次级正文**、按钮、表格 |
| `text-base` (16px) | 16 | 普通正文（少用） |
| `text-lg` (18px) | 18 | 卡片标题、强调说明 |
| `text-xl` (20px) | 20 | 章节小标题 |
| `text-2xl` (24px) | 24 | 区域大标题（"最新文章"） |
| `text-3xl` (30px) | 30 | 页面标题（articles / about） |
| `text-4xl` (36px) | 36 | Hero 主标题 |

> **规则**：不引入 `text-5xl/6xl/7xl`。需要"巨大"时用 `text-4xl` + 字重 + 字色梯度营造层级。

### 2.3 行高

| 内容类型 | 行高 |
|----------|------|
| 正文段落 | `leading-[1.8]`（custom,约 30.6px@17px）— 仅文章正文用 |
| 普通文字 | `leading-relaxed` (1.625) |
| 紧凑标题 | `leading-tight` (1.25) |
| 默认 | 不写,跟随 body 全局 1.6 |

### 2.4 字重

只用四档：`font-normal` (400) / `font-medium` (500) / `font-semibold` (600) / `font-bold` (700)。**禁用** `font-light`、`font-thin`（在小字号下不耐看）和 `font-extrabold`（过头）。

---

## 3. 间距与节奏

### 3.1 基础节奏

Tailwind 默认 4px 步进,本项目偏好以下值（按频率高低排序,避免散乱）：

| 类 | 像素 | 主要用途 |
|------|------|----------|
| `gap-2` / `p-2` | 8 | 内联元素、icon+text |
| `gap-3` / `p-3` | 12 | 紧凑列表项 |
| `gap-4` / `p-4` | 16 | 通用间距 |
| `gap-6` / `p-6` | 24 | 卡片内边距、网格 gap |
| `gap-8` / `p-8` | 32 | 区块之间 |
| `mb-12` / `mt-12` | 48 | 大区块过渡 |
| `mb-20` / `mt-20` | 80 | 页面级分段（footer 上方） |

### 3.2 容器宽度

| 场景 | 写法 |
|------|------|
| 顶级页面（首页、列表） | `<main className="w-full px-4 sm:px-6 lg:px-8 py-8">` |
| 文章详情、关于页 | `container max-w-6xl mx-auto px-4 py-12` |
| 阅读型内容（窄） | `max-w-4xl mx-auto` |

> **规则**：禁止用 `container max-w-7xl` 之类没人用的宽度。新页面**先**抄一个现有页面的容器结构。

### 3.3 圆角阶梯

| 类 | 用途 |
|------|------|
| `rounded-md` | 按钮、Badge、小元素 |
| `rounded-lg` | 输入框、代码块、卡片内嵌组件 |
| `rounded-xl` | **主卡片**（首页文章卡、相关推荐卡） |
| `rounded-2xl` | 大型容器（404 卡、文章详情主 article） |
| `rounded-full` | 头像、圆形 logo、tag dot、icon button |

> **拒绝**：`rounded-3xl` 及更大（看起来太"卡通"）、`rounded-sm`（与 `rounded-md` 视觉无差异）。

---

## 4. 阴影策略：扁平为主 + 1px 金属高光

**核心规则：用 border 表达边界,不用 elevation shadow；hover 态允许 1px 渐变高光作为金属点缀。**

### 4.1 全站禁用

| Tailwind 类 | 状态 |
|-------------|------|
| `shadow-sm/md/lg/xl/2xl` | **禁用**（已从全站移除） |
| `hover:shadow-*` | **禁用** |
| `shadow-soft / shadow-medium / shadow-strong`（自定义） | 已置空（仅保留类名兼容） |

### 4.2 例外（仅这些场景允许）

| 场景 | 写法 | 原因 |
|------|------|------|
| 弹层（Dialog/Popover/Sheet/HoverCard） | shadcn 默认 `shadow-lg` 保留 | 浮层指示性 |
| 文字描边（hero 标题在背景图上） | `drop-shadow-2xl` | 提升可读性 |
| **卡片 hover 顶边 1px 铂金高光** | `.card-hover::after` 渐变（已封装） | 表达「金属反光」铂金质感 |
| **Logo 块内层斜光** | `.brand-logo-mark::after` 45° 半透明白渐变 | 表达金属表面光泽 |

### 4.3 替代方案

需要"卡片浮起"感时,用 `card-hover` 工具类：

```css
.card-hover:hover {
  border-color: hsl(var(--primary) / 0.55);
  transform: translateY(-1px);
}
.card-hover:hover::after {
  /* 顶边 1px 铂金高光线 */
  opacity: 1;
}
```

正确用法：
```tsx
<Card className="bg-card border border-border card-hover rounded-xl">
```

---

## 5. 工具类（Utility Classes）

定义于 [app/globals.css](app/globals.css) 的 `@layer components` 块。**优先复用这些类**,不要在组件里复刻同一组样式。

| Class | 用途 | 何时用 |
|-------|------|--------|
| `card-hover` | 卡片 hover 时边框变 primary + 顶边 1px 铂金高光 + 上移 1px | 所有可点击卡片 |
| `glass` | 毛玻璃背景 + 边框（响应明暗） | navigation header、footer |
| `glass-dark` | 强制深色版毛玻璃 | 背景图覆盖区 |
| `metallic-edge` | 元素底边 1px 铂金高光线（用于分隔强调） | 仅在需要时使用,少量 |
| `brand-logo-mark` | 品牌色块（Logo L 字背景,含内层金属斜光） | 全站 logo 圆形/方形容器 |
| `brand-logo-text` | 品牌渐变文字（铂金光泽,深 → 中 slate） | 文字版 logo |
| `gradient-bg` | 品牌渐变背景 | 主 CTA 按钮（极少用） |
| `text-gradient` | 文字应用品牌渐变 | 大标题强调 |
| `border-gradient` | 双层边框渐变 | 高级卡片、特殊容器 |

**禁止**：在组件里手写 `bg-gradient-to-br from-X to-Y` 或 `box-shadow: ...`。

---

## 6. 组件规范

### 6.1 Card（卡片）

**统一写法**：
```tsx
<Card className="bg-card border border-border card-hover rounded-xl overflow-hidden group">
```

要点：
- ✅ `bg-card` 不是 `bg-white/80`
- ✅ `border border-border` 不是 `border-0` + shadow
- ✅ `card-hover` 提供统一的悬停反馈（含 1px 金属高光线）
- ✅ `rounded-xl`（普通）或 `rounded-2xl`（大型容器）

### 6.2 Button

依赖 [components/ui/button.tsx](components/ui/button.tsx) 的 shadcn variant。本项目实际使用：

| variant | 场景 |
|---------|------|
| `default` | 主操作（提交、保存）— 现为冷灰 slate-600 实心 |
| `outline` | 次操作、筛选 |
| `ghost` | 图标按钮、导航 |

**禁用**：自己写 `<button className="bg-blue-600 ...">` 跳过 Button 组件。

### 6.3 Badge

| variant | 场景 |
|---------|------|
| `secondary` | 标签、分类（最常用） |
| `outline` | 状态标记 |

**首页文章卡 tag 写法**：
```tsx
<Badge variant="secondary" className="text-xs px-2 py-1 bg-primary/10 text-primary border-0 rounded-md hover:bg-primary/20">
  {tag}
</Badge>
```

### 6.4 Navigation Header

唯一实例：[components/ConfigurableNavigation.tsx](components/ConfigurableNavigation.tsx)。

要点：
- 用 `glass border-b border-border` 顶部毛玻璃
- Logo 必须用 `brand-logo-mark` + `brand-logo-text` 组合
- 必须在右侧包含 `<ThemeToggle />`

### 6.5 ThemeToggle

实例：[components/ThemeToggle.tsx](components/ThemeToggle.tsx)。三态循环（light → dark → system）。**只在 navigation 内使用**,不要在其他位置重复添加。

### 6.6 ReadingProgressBar

实例：[components/ReadingProgressBar.tsx](components/ReadingProgressBar.tsx)。已用品牌渐变 `var(--gradient-progress)`（铂金浅→深过渡,slate-300 → slate-400 → slate-600）。**所有页面都会显示**,不要 per-page 加额外进度条。

---

## 7. 页面骨架

### 7.1 通用结构

```tsx
export default function SomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ConfigurableNavigation categories={categories} />

      {/* Hero / 页面头（可选） */}
      <section className="...">...</section>

      {/* 主内容 */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        ...
      </main>

      {/* Footer 由 layout.tsx 统一挂载,页面无需重复 */}
    </div>
  )
}
```

### 7.2 当前不一致点（待修复）

- 各页面 main padding 不一致：首页用 `px-6 sm:px-8 lg:px-12 xl:px-16`,其他用 `px-4 sm:px-6 lg:px-8`

### 7.3 分割线策略

**最少使用 border-t / border-b**。当且仅当：
- ✅ Navigation 底部 `border-b border-border`（结构必需）
- ✅ 文章详情页元数据 → 正文之间 `border-b border-border/50`（淡化为辅助）
- ❌ Footer 顶部、版权区上方（已移除）
- ❌ 卡片内分割线（已移除）

> **规则**：靠 `gap-8` / `mb-12` 等空间表达分段,不靠水平线。

---

## 8. 动画与微交互

### 8.1 现有 utility

定义在 [app/globals.css](app/globals.css)：

| Class | 用途 |
|-------|------|
| `animate-fade-in-up` | 元素从下方淡入（公告轮播） |
| `animate-fade-in-left/right` | 横向淡入 |
| `animate-scale-in` | 弹窗、模态出现 |
| `hover-lift` | 微微上移（次级强调） |
| `hover-scale` | 1.05 放大（图片、卡片图） |

### 8.2 时长规范

| 时长 | 用途 |
|------|------|
| `duration-150` | 焦点变化、按钮按下 |
| `duration-200` | hover 颜色变化（**默认**） |
| `duration-300` | 复杂状态切换（filter / 折叠） |
| `duration-500` | 图片缩放、大区域过渡 |

> **规则**：所有 `transition-*` 必须显式指定 duration。**禁用** `duration-700/1000`（拖沓）。

### 8.3 减少动画偏好

[app/globals.css](app/globals.css) 已实现 `@media (prefers-reduced-motion: reduce)`,**所有动画自动降级到 0.01ms**。新增动画时不需重复处理,但**避免**用 JS 控制的动画（无法响应 reduce-motion）。

### 8.4 Anti-Patterns（动画反例）

- ❌ **Layout-shifting hovers** —— 不要用会改变盒模型尺寸的 hover 效果（如 `hover:p-6` 从 `p-4`→`p-6`）。优先用 `transform: translateY/scale`,不触发 reflow
- ❌ **Instant state changes（0ms）** —— 任何 hover / focus / open / close 必须有 transition,150-300ms 是默认区间
- ❌ **动画 width/height/top/left** —— 性能差,只用 `transform` 与 `opacity`
- ❌ **大于 500ms 的微交互** —— 拖沓感强,用户感知为卡顿
- ❌ **未声明 duration 的 transition-*** —— `transition-all` 不写 duration 会用浏览器默认（约 0ms）,等于没动画

---

## 9. 响应式断点

跟随 Tailwind 默认：

| 前缀 | 像素 | 优先级 |
|------|------|--------|
| (无) | < 640 | Mobile-first 基础样式 |
| `sm:` | ≥ 640 | 大屏手机 |
| `md:` | ≥ 768 | 平板 |
| `lg:` | ≥ 1024 | 笔记本 |
| `xl:` | ≥ 1280 | 桌面 |
| `2xl:` | ≥ 1536 | 大屏（仅文章网格用一次） |

**当前网格实测**：

```ts
// 首页文章网格
"grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
```

> **规则**：移动端不要超过 1 列；桌面端不要超过 5 列（信息密度上限）。

---

## 10. 可访问性 (A11y)

### 10.1 必做

- [ ] 所有交互元素都有可见的 `:focus-visible` 状态（已通过 `--ring` token 全局配置）
- [ ] icon-only 按钮必须加 `aria-label`（如 `<Button aria-label="切换主题">`）
- [ ] 颜色对比度：正文 `text-foreground/85` on `bg-card` 在两套主题下均 ≥ 4.5:1（已校准）
- [ ] 主色 `--primary` 在亮色 `#475569` (slate-600) 对白色背景对比 7.4:1,在暗色 `#94A3B8` (slate-400) 对黑曜石黑 8.5:1,均超 WCAG AAA

### 10.2 焦点环

```tsx
<Button className="focus-ring">  // 用预设
<input className="focus-ring" />
```

`.focus-ring` = `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`

---

## 11. 文章正文渲染（特例区）

文章详情页正文区（`<article>` 内）由 [lib/notion-content.js](lib/notion-content.js) 输出 HTML。所有样式**已 token 化**,与全站主题联动。

| 元素 | 类 |
|------|-----|
| 段落 `<p>` | `mb-8 text-foreground/85 leading-[1.8] text-[17px]` |
| H1 | `text-4xl font-bold text-foreground mb-8 mt-12 pt-4 border-t-2 border-border` |
| H2 | `text-3xl font-bold text-foreground/85 mb-6 mt-10 pb-2 border-b border-border` |
| H3 | `text-2xl font-semibold text-foreground/85 mb-4 mt-8` |
| 行内 `<a>` | `text-primary hover:text-primary/80 underline decoration-primary/60` |
| 行内 `<code>` | `bg-muted text-rose-600 dark:text-rose-400` |
| `<blockquote>` | `border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-lg` |
| `<table>` | `border border-border` 包 `border border-border` 单元格 |

**例外**：代码块用 `bg-gray-950 text-gray-100`（VS Code 深色风格）,无论主题如何都保持深色 — 这是阅读代码的通用习惯,不视为破坏 token 化。

---

## 12. 交付前检查清单（Pre-Delivery Checklist）

> 提交 PR 或合并到 main 前,逐项核对。任何一项 ❌ 都必须修复或在 PR 描述中显式声明例外。

### 视觉一致性
- [ ] 没用 emoji 作为图标（必用 Lucide / Heroicons SVG）
- [ ] 所有图标来自统一图标家族（项目用 Lucide）
- [ ] 没在组件里硬编码 hex / rgb 或 `text-blue-X` / `text-violet-X` 等 Tailwind 原色
- [ ] 没出现拒绝清单里的色：紫、粉装饰、sky/cyan 主色
- [ ] 没用 `shadow-sm/md/lg/xl/2xl` 表达层级（仅弹层例外）

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`（或语义化 `<button>` / `<a>`）
- [ ] hover / focus 状态有 transition,duration 显式声明（150-300ms）
- [ ] 焦点环可见（`focus-ring` 类或 shadcn 默认）
- [ ] 触摸目标 ≥ 44×44pt（移动端按钮、icon 按钮）
- [ ] icon-only 按钮带 `aria-label`

### 明暗主题
- [ ] 在 light + dark 两套主题下都验证过（重要！dark 漏适配是最常见的 regression）
- [ ] 装饰彩色都显式声明 dark 变体（`dark:text-X-400`）
- [ ] 文字对比度在两套主题下均 ≥ 4.5:1

### 响应式
- [ ] 在 375px / 768px / 1024px / 1440px 四档下都验证过布局
- [ ] 没出现移动端横向滚动（`overflow-x: hidden` 不算合理修复 — 找根本原因）
- [ ] 移动端单列、桌面端 ≤ 5 列

### 可访问性
- [ ] 标题层级连续（h1 → h2 → h3,不跳级）
- [ ] 图片有 `alt`（装饰性可空,内容性必填）
- [ ] 表单 input 有关联 `<label>` 或 `aria-label`
- [ ] `prefers-reduced-motion` 下动画自动降级（已全局处理,但避免 JS 动画）

### 性能
- [ ] 没有 `import` 大型库的全部模块（用按需导入）
- [ ] 图片优先用 `UnifiedImage` 组件（处理 Notion S3 URL 过期）
- [ ] 没在组件里 inline 大字符串（>200 字符的 SVG 应外置）

---

## 13. 待办与规划

按优先级排序：

### P1（规范填充）
- [ ] 抽 `<PageHeader title description />` 组件统一所有列表页头
- [ ] 抽 `<SectionTitle />` 组件统一 "最新文章 / 相关推荐 / 资源信息" 那种二级标题
- [ ] 各页面 `<main>` padding 统一为 `px-4 sm:px-6 lg:px-8 py-8`

### P2（可选增强）
- [ ] 评估引入 1 款 display 字体用于 H1（如 Newsreader / Fraunces）— 目前全站只用 Inter,缺一点性格
- [ ] 设计一套统一的"空状态" / "错误状态"插画或图标方案
- [ ] 评估在 Hero 区加入极轻 radial 铂金光晕（径向渐变背景）作为「锦上添花」点缀

### P3（实验性）
- [ ] 评估引入语义化间距 token（`--space-xs/sm/md/lg/xl`）替代纯 Tailwind 数字阶梯,统一 design tokens
- [ ] 评估在大屏复杂内容页（如文档型页面）引入显式 12 列 grid

---

## 14. 维护规则

> 这一节是**给未来读者的元规则**。

1. **改这份文档** —— 如果你做出与本规范不一致的视觉决策,先改这里再改代码
2. **不要复刻样式** —— 如果发现自己在多处写同一组 className,把它抽成 utility class（写进第 5 节）或组件
3. **不要"临时方案"** —— 任何 `// TODO: 后面统一` 都是技术债。要么立刻规范化,要么在第 13 节登记
4. **明暗双向验证** —— 任何新组件必须切两种主题各看一次。深色下漏适配是最常见的 regression
5. **删除优于添加** —— 看到没用的 className（如孤儿 `shadow-soft`、未引用的渐变）直接删,不要"以防万一"
6. **Page overrides** —— 如果某个页面（如 `/about`）有特殊视觉需求,在 `design-system/pages/about.md` 写下例外规则,而不是污染本 Master

---

## Last edits

- 2026-04-30 ~ 2026-05-05：午夜青蓝色板、扁平化、明暗主题完成
- 2026-05-06：DESIGN.md 诞生 — 把散落决策固化为规范
- 2026-05-06：P0 完成 — 抽出 SiteFooter、articles 列表卡统一
- 2026-05-06：清理全站 13 处 `bg-card/80 backdrop-blur-sm border-0` 残留
- 2026-05-07：**整体配色重构** — 从「午夜青蓝」改为「科技铂金风」,primary 改为 slate-600 / slate-400,饱和度 ≤19%；引入铂金 5-stop 反光渐变与 1px 金属高光；明确拒绝 sky/cyan 高饱和色作为主色
- 2026-05-07：**主题 token 抽离到 [config/theme.ts](config/theme.ts)** — 亮/暗两套独立对象,由 [components/ThemeStyleInjector.tsx](components/ThemeStyleInjector.tsx) 在 SSR 注入。globals.css 不再持有颜色 token。删除全部未引用的别名 token,27 个真正影响主题的 token 集中管理
- 2026-05-07：**DESIGN.md 迁移到 design-system/MASTER.md** — 吸收 ui-ux-pro-max 模板的 Pre-Delivery Checklist（第 12 节）与显式动画 anti-patterns（第 8.4 节）；引入 page overrides 模式（第 14.6 条）以支持页面级例外
- 2026-05-07：**引入墨青琥珀配色（方案 B）** — 在 slate 主体之上新增唯一装饰强调色 amber（亮 #B45309 / 暗 #F59E0B）。新增 §1.6 章节、`.badge-warm` / `.badge-warm-soft` / `.text-warm` / `.underline-warm` 四个 utility class。明确与状态色 amber-warning 的区分规则（hex 差一档 + icon 强制 + 面积上限 ≤ 2%）。改动文件：[config/theme.ts](config/theme.ts) +4 行、[tailwind.config.ts](tailwind.config.ts) +4 行、[app/globals.css](app/globals.css) +25 行
