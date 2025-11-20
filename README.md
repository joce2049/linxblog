# 🚀 LinX 后期工坊 - 资源分享与技术交流平台

一个基于 Next.js 14 和 Notion API 构建的现代化博客平台，专注于优质资源分享和技术交流。

## ✨ 主要特性

### 🎯 核心功能
- **资源管理**: 基于 Notion 数据库的内容管理系统
- **智能搜索**: 支持关键词、分类、标签的多维度搜索
- **响应式设计**: 完美适配桌面端和移动端
- **SEO 优化**: 完整的 SEO 配置和结构化数据

### 🚀 性能优化
- **图片懒加载**: 智能图片加载，提升页面性能
- **代码分割**: 按需加载，减少初始包大小
- **缓存策略**: 客户端缓存和 API 缓存优化
- **性能监控**: 实时性能指标监控（开发环境）

### 🎨 用户体验
- **阅读进度条**: 顶部进度指示器
- **返回顶部**: 平滑滚动返回顶部按钮
- **加载动画**: 优雅的加载状态和骨架屏
- **错误处理**: 友好的错误提示和恢复机制
- **宽屏设计**: 所有页面采用全宽布局，最大化内容展示空间

### 🔧 技术特性
- **TypeScript**: 完整的类型支持
- **Tailwind CSS**: 现代化的 CSS 框架
- **组件化**: 可复用的 UI 组件库
- **主题支持**: 明暗主题切换

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式框架**: Tailwind CSS
- **UI 组件**: Radix UI + 自定义组件
- **内容管理**: Notion API
- **类型安全**: TypeScript
- **图标库**: Lucide React
- **字体**: Geist (Google Fonts)

## 📦 安装与运行

### 环境要求
- Node.js 18+ 
- pnpm (推荐) 或 npm

### 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd lindx-blog
```

2. **安装依赖**
```bash
pnpm install
# 或
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入你的 Notion 配置
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
```

4. **启动开发服务器**
```bash
pnpm dev
# 或
npm run dev
```

5. **访问网站**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🎨 设计规范

### 布局设计原则
- **宽屏优先**: 所有页面采用 `max-w-none` 的全宽布局设计
- **内容最大化**: 充分利用屏幕宽度，提供最佳的内容浏览体验
- **响应式适配**: 在保持宽屏设计的同时，确保移动端体验
- **统一性**: 所有页面（首页、文章列表、搜索页面等）都遵循相同的宽屏设计原则

### 搜索框设计规范
- **边框颜色**: 使用 `border-blue-200/50` 浅蓝色边框，与导航栏搜索框保持一致
- **聚焦状态**: 聚焦时边框变为 `border-blue-400`，提供清晰的视觉反馈
- **圆角设计**: 统一使用 `rounded-2xl` 大圆角，符合现代UI设计趋势
- **样式统一**: 所有搜索框（导航栏、搜索页面）都使用相同的边框颜色和聚焦状态
- **视觉层次**: 浅蓝色边框在白色背景下提供适度的视觉边界，不会过于突兀
- **高级聚焦效果**: 使用 `ring-offset-2 ring-offset-white` 创建白色偏移环，增强视觉层次
- **尺寸一致性**: 搜索框和搜索按钮都使用 `h-14` 高度，保持完美对齐
- **现代设计元素**: 采用 `ring-2` 替代厚重的 `ring-4`，更加精致和现代

### 首页分类筛选器设计
- **固定选项**: 首页显示固定的分类选项（全部、视频、平面、三维、音频），不依赖动态数据
- **选中状态**: 点击后只显示选中状态，选项本身不会变化
- **视觉一致性**: 与网站整体设计风格保持一致，使用蓝色主题
- **用户体验**: 提供稳定的分类导航，用户知道每次都能看到相同的选项

### 排序选择器设计规范
- **颜色统一**: 使用与搜索框一致的浅蓝色边框 `border-blue-200/50`
- **聚焦效果**: 聚焦时边框变为 `border-blue-400`，使用 `ring-offset-2` 创建白色偏移环
- **背景样式**: 触发器使用 `bg-gray-50/80` 半透明背景，下拉内容使用纯白背景确保可读性
- **悬停状态**: 选项悬停时使用 `hover:bg-blue-50` 淡蓝色背景，聚焦时使用 `focus:bg-blue-100`
- **文字可见性**: 使用 `data-[highlighted]:bg-blue-100 data-[highlighted]:text-gray-900` 确保高亮状态下文字清晰可见
- **圆角设计**: 统一使用 `rounded-xl` 圆角，与整体设计风格保持一致

### 文章卡片布局设计
- **信息整合**: 统计信息（浏览、点赞、评论）与发布时间在同一行显示
- **两边对齐**: 使用 `justify-between` 实现统计信息左对齐，发布时间右对齐
- **视觉层次**: 移除分隔线，简化布局，提升视觉整洁度
- **间距优化**: 统计信息内部使用 `space-x-4`，发布时间使用 `space-x-2`
- **响应式设计**: 保持在不同屏幕尺寸下的良好显示效果

### 图片加载问题修复
- **问题诊断**: 识别出Notion AWS S3预签名URL过期问题（`X-Amz-Expires=3600`）
- **架构修复**: 解决Next.js Server Component中无法使用事件处理器的问题
- **组件化方案**: 使用 `SimpleImage` Client Component替代原生 `<img>` 标签
- **优雅降级**: 图片加载失败时自动隐藏，避免显示破损图片
- **页面覆盖**: 修复首页、文章列表页、搜索页、文章详情页的图片处理
- **用户体验**: 确保图片加载失败时不影响页面整体布局和美观
- **组件优化**: 创建轻量级 `ReliableImage` 组件，提供错误处理和占位符显示
- **诊断工具**: 创建图片状态诊断页面 (`/image-status`) 和API (`/api/debug-images`)，帮助分析图片加载问题

## ⚙️ 配置说明

### 分类筛选器配置

项目支持完全自定义的分类筛选器配置，用户可以通过修改 `config/site.ts` 文件来控制分类的显示、隐藏、排序和样式。

#### 主要配置选项

```typescript
// 在 config/site.ts 的 features.categoryManagement.filter 部分
filter: {
  enabled: true,           // 是否启用分类筛选器
  showAllButton: true,     // 是否显示"全部"按钮
  maxVisible: 10,          // 最大可见分类数量
  
  visibility: {
    mode: "show_all",      // 显示模式：show_all | hide_all | custom
    custom: {
      show: ["视频", "软件", "三维", "平面"], // 要显示的分类
      hide: [],            // 要隐藏的分类
    },
    order: ["视频", "软件", "三维", "平面"], // 分类显示顺序
  },
  
  styling: {
    buttonSize: "sm",      // 按钮大小：sm | md | lg
    buttonVariant: "outline", // 按钮样式
    colors: {
      active: "blue",      // 选中状态颜色
      inactive: "gray",    // 未选中状态颜色
      hover: "blue",       // 悬停状态颜色
    },
  },
}
```

#### 快速配置示例

- **只显示核心分类**: 设置 `visibility.mode: "custom"` 并配置 `custom.show` 数组
- **隐藏特定分类**: 在 `custom.hide` 数组中添加要隐藏的分类名称
- **自定义样式**: 修改 `styling` 部分的颜色和尺寸配置
- **响应式布局**: 设置 `maxVisible` 控制分类显示数量，超出时自动显示展开按钮

详细配置说明请参考 `docs/category-filter-config.md` 文件。

### Notion 数据库配置

项目使用 `config/site.ts` 文件进行集中配置管理：

```typescript
export const envConfig = {
  notion: {
    apiKey: process.env.NOTION_API_KEY!,
    databaseId: process.env.NOTION_DATABASE_ID!,
    properties: {
      title: '标题',
      description: '描述',
      category: '分类',
      tags: '标签',
      image: '封面图片',
      url: '资源链接',
      date: '创建时间',
      views: '浏览量',
      likes: '点赞数',
      comments: '评论数'
    }
  }
}
```

### 页面布局配置

可以自定义各个页面的网格布局：

```typescript
export const siteConfig = {
  pages: {
    home: {
      grid: {
        columns: 3, // 首页文章卡片列数
        gap: 6      // 间距
      }
    },
    articles: {
      grid: {
        columns: 5, // 文章页面列数
        gap: 6      // 间距
      }
    }
  }
}
```

## 🔧 可用脚本

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 代码检查
pnpm lint

# 类型检查
pnpm type-check

# 设置 Notion 配置
pnpm setup

# 测试 Notion 连接
pnpm test:notion

# 检查数据库结构
pnpm check:db
```

## 📁 项目结构

```
lindx-blog/
├── app/                    # Next.js App Router 页面
│   ├── articles/          # 文章相关页面
│   ├── categories/        # 分类页面
│   ├── tags/             # 标签页面
│   ├── search/           # 搜索页面
│   ├── about/            # 关于页面
│   └── api/              # API 路由
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── ConfigurableNavigation.tsx  # 可配置导航
│   ├── OptimizedImage.tsx         # 优化图片组件
│   ├── ReadingProgressBar.tsx     # 阅读进度条
│   ├── BackToTop.tsx              # 返回顶部
│   ├── ErrorBoundary.tsx          # 错误边界
│   └── LoadingSpinner.tsx         # 加载状态
├── config/               # 配置文件
│   └── site.ts          # 站点配置
├── lib/                  # 工具库
│   ├── notion.js        # Notion API 集成
│   └── utils.ts         # 工具函数
├── hooks/                # 自定义 Hooks
├── styles/               # 样式文件
└── public/               # 静态资源
```

## 🎨 自定义主题

### 颜色配置

在 `tailwind.config.ts` 中自定义颜色：

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    }
  }
}
```

### 组件样式

使用 CSS 变量和 Tailwind 类名自定义组件样式：

```css
/* 自定义组件样式 */
.card-hover {
  @apply transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50;
}

.glass {
  @apply bg-white/80 backdrop-blur-sm border border-white/20;
}
```

## 🚀 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署

### 其他平台

项目支持部署到任何支持 Node.js 的平台：

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 性能优化

### 图片优化
- 使用 `OptimizedImage` 组件
- 支持懒加载和渐进式加载
- 自动错误处理和占位符

### 代码分割
- 页面级代码分割
- 组件懒加载
- 动态导入

### 缓存策略
- 客户端缓存
- API 响应缓存
- 静态资源缓存

## 🔍 SEO 优化

### Meta 标签
- 动态标题和描述
- Open Graph 和 Twitter Cards
- 结构化数据 (JSON-LD)

### 性能指标
- Core Web Vitals 优化
- 图片优化
- 字体优化

## 🧪 测试

### 组件测试
```bash
# 运行组件测试
pnpm test:components

# 运行 E2E 测试
pnpm test:e2e
```

### 性能测试
```bash
# Lighthouse 测试
pnpm test:lighthouse

# Bundle 分析
pnpm analyze
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

### v2.0.0 (最新)
- ✨ 新增性能监控组件
- 🎨 优化图片加载体验
- 🚀 添加阅读进度条和返回顶部
- 🔧 完善错误处理和加载状态
- 📱 增强移动端体验

### v1.0.0
- 🎉 初始版本发布
- 📚 基础博客功能
- 🔍 搜索和分类功能
- 📱 响应式设计

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目主页: [GitHub Repository](https://github.com/your-username/lindx-blog)
- 问题反馈: [Issues](https://github.com/your-username/lindx-blog/issues)
- 邮箱: your-email@example.com

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Notion](https://notion.so/) - 内容管理
- [Vercel](https://vercel.com/) - 部署平台

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
