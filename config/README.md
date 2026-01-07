# 网站配置文档

<p align="center">
  <a href="../README.md">← 返回项目主页</a>
</p>

> 📖 完整的配置参考手册 - 了解如何自定义你的网站

## 📑 目录

- [配置文件说明](#配置文件说明)
- [配置模块](#配置模块)
  - [1. 品牌配置](#1-品牌配置-brand)
  - [2. 基本信息](#2-基本信息)
  - [3. SEO 配置](#3-seo-配置-seo)
  - [4. 社交媒体配置](#4-社交媒体配置-social)
  - [5. 导航配置](#5-导航配置-navigation)
  - [6. 页脚配置](#6-页脚配置-footer)
  - [7. 页面配置](#7-页面配置-pages)
  - [8. UI 配置](#8-ui-配置-ui)
  - [9. 性能优化配置](#9-性能优化配置-performance)
  - [10. 通知配置](#10-通知配置-notifications)
  - [11. 功能开关](#11-功能开关-features)
  - [12. 内容配置](#12-内容配置-content)
  - [13. 调试配置](#13-调试配置-debug)
  - [14. 部署配置](#14-部署配置-deployment)
  - [15. 维护配置](#15-维护配置-maintenance)
- [环境变量配置](#环境变量配置)
- [快速开始](#快速开始)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## 配置文件说明

### `site.ts` - 主配置文件

所有网站配置都集中在 `config/site.ts` 文件中，方便统一管理和维护。

---

## 配置模块

### 1. 品牌配置 `brand`

管理网站的品牌元素。

```typescript
brand: {
  name: "LinX 后期工坊",           // 品牌名称
  logo: "/logo.png",              // Logo 路径
  favicon: "/favicon.ico",        // 网站图标
  colors: {
    primary: "#3B82F6",          // 主色调
    secondary: "#8B5CF6",        // 次要色
    accent: "#10B981"            // 强调色
  },
  tagline: "资源分享与技术交流",   // 品牌标语
  slogan: "分享优质的资源..."     // 品牌口号
}
```

**使用示例**：
```typescript
import { siteConfig } from '@/config/site'
const brandName = siteConfig.brand.name
```

---

### 2. 基本信息

```typescript
name: "LinX 后期工坊",           // 网站名称
description: "...",              // 网站描述
url: "https://lindx.top"          // 网站域名（重要！）
```

⚠️ **重要**：`url` 配置会影响：
- SEO 优化（OpenGraph、Canonical URL）
- 网站地图（sitemap.xml）
- 社交媒体分享

---

### 3. SEO 配置 `seo`

统一管理所有 SEO 相关设置。

```typescript
seo: {
  enabled: true,
  metadata: {
    title: "LinX 后期工坊",
    titleTemplate: "%s | LinX 后期工坊",  // 页面标题模板
    description: "...",
    keywords: ["资源分享", "设计资源", ...],
    author: "LinX",
    siteName: "LinX 后期工坊",
    locale: "zh_CN",
    ogImage: {                            // OpenGraph 图片
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "LinX 后期工坊"
    }
  },
  verification: {                         // 搜索引擎验证
    google: "",
    baidu: "",
    bing: ""
  }
}
```

**自动应用到**：
- `app/layout.tsx` 的 metadata
- 所有页面的 SEO 标签
- 社交媒体分享预览

---

### 4. 社交媒体配置 `social`

```typescript
social: {
  email: "contact@linx.com",
  platforms: {
    bilibili: {
      name: "哔哩哔哩",
      url: "https://space.bilibili.com/173981850",
      icon: "BilibiliIcon",
      show: true                // 是否显示
    },
    xiaohongshu: {
      name: "小红书",
      url: "...",
      icon: "XiaohongshuIcon",
      show: true
    }
  }
}
```

**添加新平台**：
```typescript
weibo: {
  name: "微博",
  url: "https://weibo.com/your-id",
  icon: "WeiboIcon",
  show: true
}
```

---

### 5. 导航配置 `navigation`

```typescript
navigation: {
  main: [
    { name: "首页", href: "/", icon: "Home", visible: true },
    { name: "文章", href: "/articles", icon: "FileText", visible: true },
    // ... 可以添加更多导航项
  ],
  config: {
    showSearch: true,           // 是否显示搜索框
    showUserMenu: false,        // 是否显示用户菜单
    enableSubmenu: true,        // 是否启用二级菜单
    mobileBreakpoint: "md"      // 移动端断点
  }
}
```

---

### 6. 页脚配置 `footer`

```typescript
footer: {
  description: "分享优质的资源、影视应用、学习资料...",
  links: [
    { name: "关于本站", href: "/about" },
    { name: "友情链接", href: "/links" },
    { name: "隐私政策", href: "/privacy" },
    { name: "RSS订阅", href: "/rss" }
  ],
  copyright: {
    year: 2024,
    owner: "LinX 后期工坊",
    statement: "Powered by Notion API & Next.js"
  },
  showSocial: true              // 是否显示社交媒体链接
}
```

---

### 7. 页面配置 `pages`

#### 首页配置 `pages.home`

```typescript
home: {
  title: "LinX 后期工坊",
  subtitle: "资源分享与技术交流",
  disclaimer: {
    line1: "声明：分享资源仅供用户交流学习与研究使用...",
    line2: "若无意中侵犯到您的版权利益..."
  },
  featuredCount: 30,            // 首页显示文章数量
  pagination: {
    itemsPerPage: 30,
    showPageInfo: true,
    showQuickJump: true
  },
  grid: {
    columns: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3...",
    gap: "gap-6"
  }
}
```

#### 文章页配置 `pages.articles`

```typescript
articles: {
  itemsPerPage: 30,
  sortOptions: [
    { value: "newest", label: "最新" },
    { value: "oldest", label: "最旧" },
    { value: "popular", label: "最热" }
  ],
  grid: { ... }
}
```

#### 搜索页配置 `pages.search`

```typescript
search: {
  placeholder: "输入关键词搜索资源...",
  suggestions: [
    "尝试使用更简单的关键词",
    "检查拼写是否正确",
    "使用分类或标签筛选"
  ]
}
```

---

### 8. UI 配置 `ui`

```typescript
ui: {
  theme: {
    primary: "blue",
    secondary: "purple",
    accent: "green"
  },
  layout: {
    maxWidth: "7xl",                    // 最大宽度
    containerPadding: "px-4 sm:px-6 lg:px-8"
  },
  cards: {
    imageAspectRatio: "aspect-video",
    hoverEffect: true,
    showStats: true                     // 显示浏览量、点赞等
  }
}
```

---

### 9. 性能优化配置 `performance`

```typescript
performance: {
  images: {
    lazy: true,                         // 懒加载
    placeholder: "blur",                // 占位符
    quality: 75,                        // 图片质量
    formats: ["avif", "webp"]          // 支持格式
  },
  cache: {
    staticAssets: 31536000,             // 静态资源缓存（秒）
    apiData: 300                        // API 数据缓存
  },
  prefetch: {
    enabled: true,
    priority: ["articles"]              // 优先预加载的页面
  }
}
```

---

### 10. 通知配置 `notifications`

```typescript
notifications: {
  enabled: true,
  banner: {
    show: true,
    type: "info",                       // info | warning | success | error
    message: "博主正在后台更新中...",
    dismissible: true,                  // 是否可关闭
    icon: true                          // 是否显示图标
  }
}
```

---

### 11. 功能开关 `features`

#### 评论系统

```typescript
comments: {
  enabled: false,                       // 是否启用
  provider: "disqus",                   // disqus | giscus | utterances
  config: {}
}
```

#### 统计分析

```typescript
analytics: {
  enabled: true,
  provider: "supabase",                 // google | umami | supabase
  trackingId: ""
}
```

#### 搜索功能

```typescript
search: {
  enabled: true,
  provider: "local",                    // local | algolia
  highlightResults: true,
  filters: {
    category: true,
    tag: true,
    date: true
  }
}
```

#### RSS 订阅

```typescript
rss: {
  enabled: true,
  feedUrl: "/feed.xml"
}
```

#### 分类管理

```typescript
categoryManagement: {
  enabled: true,
  filter: {
    enabled: true,
    showAllButton: true,
    maxVisible: 15,
    visibility: {
      mode: "custom",                   // show_all | hide_all | custom
      custom: {
        show: ["视频", "软件", ...],    // 显示的分类
        hide: ["脚本", "样机"]          // 隐藏的分类
      }
    },
    styling: {
      buttonSize: "md",
      buttonVariant: "default",
      colors: {
        active: "green",
        inactive: "slate",
        hover: "emerald"
      }
    }
  }
}
```

---

### 12. 内容配置 `content`

```typescript
content: {
  categories: {
    defaultColor: "blue",
    showCount: true,
    showRecent: true
  },
  tags: {
    defaultColor: "gray",
    showCount: true,
    maxDisplay: 5                       // 卡片上最多显示的标签数
  },
  articles: {
    excerptLength: 120,                 // 摘要长度
    showDate: true,
    showAuthor: false,
    showReadingTime: false
  },
  relatedArticles: {
    maxCount: 5,                        // 最大推荐数量
    priority: {                         // 推荐权重
      tagMatch: 10,
      categoryMatch: 5,
      highViews: 3,
      recentDate: 2
    },
    minViews: 100                       // 最低浏览量阈值
  }
}
```

---

### 13. 调试配置 `debug`

```typescript
debug: {
  enabled: process.env.NODE_ENV === "development",
  showConfig: false,                    // 显示配置信息
  showPerformance: false,               // 显示性能指标
  logLevel: "info"                      // error | warn | info | debug
}
```

---

### 14. 部署配置 `deployment`

```typescript
deployment: {
  platform: "vercel",                   // 部署平台
  environment: "production"             // 环境
}
```

---

### 15. 维护配置 `maintenance`

```typescript
maintenance: {
  enabled: false,                       // 是否启用维护模式
  message: "网站正在维护中，请稍后再试...",
  allowedIPs: []                        // 允许访问的 IP
}
```

---

## 环境变量配置

### `envConfig` - 环境变量

```typescript
envConfig = {
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID,
    properties: {                       // Notion 数据库字段映射
      title: "标题",
      category: "类型",
      tags: "标签",
      // ... 根据实际数据库结构调整
    },
    fetch: {
      pageSize: 100,
      maxRetries: 3,
      retryDelay: 1000
    }
  },
  app: {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || 3000
  }
}
```

### 环境变量文件 `.env.local`

```bash
# Notion 配置
NOTION_API_KEY=secret_your_api_key
NOTION_DATABASE_ID=your_database_id

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 快速开始

### 1. 修改基本信息

```typescript
// config/site.ts
export const siteConfig = {
  brand: {
    name: "你的网站名",
    slogan: "你的网站口号"
  },
  url: "https://your-domain.com",      // ⚠️ 重要！
  seo: {
    metadata: {
      title: "你的网站名",
      description: "你的网站描述"
    }
  }
}
```

### 2. 配置社交媒体

```typescript
social: {
  email: "your-email@example.com",
  platforms: {
    // 添加你的社交平台链接
  }
}
```

### 3. 设置环境变量

创建 `.env.local` 文件并配置必要的环境变量。

### 4. 自定义功能

根据需要启用或禁用功能：

```typescript
features: {
  comments: { enabled: true },          // 启用评论
  rss: { enabled: true },              // 启用 RSS
  // ...
}
```

---

## 配置优势

✅ **统一管理** - 所有配置集中在一个文件  
✅ **类型安全** - TypeScript 类型检查  
✅ **易于维护** - 清晰的模块划分  
✅ **灵活扩展** - 易于添加新功能  
✅ **环境隔离** - 敏感信息使用环境变量

---

## 常见问题

### Q: 如何修改网站域名？
A: 修改 `siteConfig.url`，会自动应用到 SEO、sitemap 等所有地方。

### Q: 如何添加新的导航菜单？
A: 在 `navigation.main` 数组中添加新项。

### Q: 如何启用评论功能？
A: 设置 `features.comments.enabled = true` 并配置 provider。

### Q: 配置修改后需要重启吗？
A: 开发环境会自动热更新，生产环境需要重新构建部署。

---

## 更新日志

### 2024-12-08
- ✅ 添加品牌配置模块
- ✅ 合并 SEO 配置，统一管理
- ✅ 优化页脚配置
- ✅ 添加性能优化配置
- ✅ 添加通知/横幅配置
- ✅ 优化社交媒体配置结构
- ✅ 重构功能开关配置
- ✅ 添加调试配置

---

## 技术支持

如有问题，请查看：
- [项目主页](../README.md)
- [Next.js 文档](https://nextjs.org/docs)
- [Notion API 文档](https://developers.notion.com/)

---

<p align="center">
  <a href="../README.md">← 返回项目主页</a>
</p>
