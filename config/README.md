# 📋 配置文件使用说明

## 🎯 概述

`config/site.ts` 文件包含了网站的所有配置信息，方便运营管理和共享使用。所有需要用户配置的信息都集中在这里，无需修改代码文件。

## 🔧 主要配置项

### 1. 基本信息配置

```typescript
export const siteConfig = {
  name: "LinX 后期工坊",                    // 网站名称
  description: "基于 Notion 数据库构建的知识分享平台...", // 网站描述
  url: "https://your-domain.com",         // 网站域名
}
```

### 2. 联系信息配置

```typescript
contact: {
  email: "contact@linx.com",             // 联系邮箱
  github: "https://github.com/linx",     // GitHub 链接
  twitter: "https://twitter.com/linx",   // Twitter 链接
  wechat: "your-wechat-id",              // 微信 ID
}
```

### 3. 社交媒体链接

```typescript
social: {
  github: "https://github.com/linx",     // GitHub
  twitter: "https://twitter.com/linx",   // Twitter
  weibo: "https://weibo.com/linx",       // 微博
  bilibili: "https://space.bilibili.com/linx", // B站
}
```

### 4. 导航菜单配置

```typescript
navigation: {
  main: [                                // 主导航菜单
    { name: "首页", href: "/", icon: "Home" },
    { name: "文章", href: "/articles", icon: "FileText" },
    // ... 更多菜单项
  ],
  footer: [                              // 页脚链接
    { name: "关于本站", href: "/about" },
    { name: "友情链接", href: "/links" },
    // ... 更多链接
  ],
}
```

### 5. 页面配置

```typescript
pages: {
  home: {
    heroTitle: "发现优质资源，提升创作效率",    // 首页标题
    heroSubtitle: "基于 Notion 数据库构建的知识分享平台", // 首页副标题
    featuredCount: 30,                    // 首页显示的文章数量
    pagination: {
      itemsPerPage: 30,                   // 每页显示的文章数量
      showPageInfo: true,                 // 是否显示分页信息
      showQuickJump: true,                // 是否显示快速跳转
    },
    // 网格布局配置
    grid: {
      columns: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", // 响应式列数
      gap: "gap-6",                       // 网格间距
    },
  },
  articles: {
    itemsPerPage: 12,                     // 每页显示的文章数量
    sortOptions: [                        // 排序选项
      { value: "newest", label: "最新" },
      { value: "oldest", label: "最旧" },
      { value: "popular", label: "最热" },
    ],
    // 网格布局配置
    grid: {
      columns: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", // 响应式列数
      gap: "gap-6",                       // 网格间距
    },
  },
}
```

### 6. UI 配置

```typescript
ui: {
  theme: {
    primary: "blue",                      // 主色调
    secondary: "purple",                  // 次要色调
    accent: "green",                      // 强调色
  },
  layout: {
    maxWidth: "7xl",                      // 最大宽度
    containerPadding: "px-4 sm:px-6 lg:px-8", // 容器内边距
  },
  cards: {
    imageAspectRatio: "aspect-video",     // 图片宽高比
    hoverEffect: true,                    // 是否启用悬停效果
    showStats: true,                      // 是否显示统计信息
  },
}
```

### 7. 功能配置

```typescript
features: {
  search: {
    enabled: true,                        // 是否启用搜索
    highlightResults: true,               // 是否高亮搜索结果
    filters: {                            // 搜索筛选器
      category: true,                     // 分类筛选
      tag: true,                          // 标签筛选
      date: true,                         // 日期筛选
    },
  },
  comments: {
    enabled: false,                       // 是否启用评论
    provider: "disqus",                   // 评论系统提供商
  },
  analytics: {
    enabled: false,                       // 是否启用统计
    provider: "google",                   // 统计服务提供商
    trackingId: "",                       // 跟踪 ID
  },
}
```

### 8. 内容配置

```typescript
content: {
  categories: {
    defaultColor: "blue",                 // 分类默认颜色
    showCount: true,                      // 是否显示数量
    showRecent: true,                     // 是否显示最新文章
  },
  tags: {
    defaultColor: "gray",                 // 标签默认颜色
    showCount: true,                      // 是否显示数量
    maxDisplay: 3,                        // 卡片上最多显示的标签数量
  },
  articles: {
    excerptLength: 120,                   // 文章摘要长度
    showDate: true,                       // 是否显示日期
    showAuthor: false,                    // 是否显示作者
    showReadingTime: false,               // 是否显示阅读时间
  },
  // 相关资源推荐配置
  relatedArticles: {
    maxCount: 5,                          // 最大推荐数量
    priority: {
      tagMatch: 10,                       // 标签匹配权重
      categoryMatch: 5,                   // 分类匹配权重
      highViews: 3,                       // 高浏览量权重
      recentDate: 2,                      // 最近发布权重
    },
    minViews: 100,                        // 最低浏览量阈值
  },
}
}
```

## 🚀 快速配置指南

### 1. 修改网站信息

```typescript
// 修改网站名称和描述
name: "你的网站名称",
description: "你的网站描述",

// 修改联系信息
contact: {
  email: "your-email@example.com",
  github: "https://github.com/your-username",
  // ... 其他信息
}
```

### 2. 调整页面布局

```typescript
// 修改首页显示的文章数量
pages: {
  home: {
    featuredCount: 20, // 改为 20 篇
  },
}

// 修改文章列表每页数量
pages: {
  articles: {
    itemsPerPage: 16, // 改为 16 篇
  },
}

// 自定义网格布局
pages: {
  home: {
    grid: {
      columns: "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", // 修改列数
      gap: "gap-8", // 修改间距
    },
  },
  articles: {
    grid: {
      columns: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6", // 修改列数
      gap: "gap-8", // 修改间距
    },
  },
}
```

**网格布局说明：**
- **columns**: 响应式列数配置，支持不同屏幕尺寸
- **gap**: 网格间距，可调整卡片之间的空间
- **响应式断点**: `sm:` (640px+), `md:` (768px+), `lg:` (1024px+), `xl:` (1280px+), `2xl:` (1536px+)

### 3. 自定义主题色彩

```typescript
ui: {
  theme: {
    primary: "red",      // 改为红色主题
    secondary: "orange", // 改为橙色次要色
    accent: "yellow",    // 改为黄色强调色
  },
}
```

### 4. 启用/禁用功能

```typescript
features: {
  search: {
    enabled: false,      // 禁用搜索功能
  },
  comments: {
    enabled: true,       // 启用评论功能
  },
  analytics: {
    enabled: true,       // 启用统计功能
    provider: "google",
    trackingId: "GA-XXXXXXXXX",
  },
}
```

### 5. 相关资源推荐配置

```typescript
content: {
  relatedArticles: {
    maxCount: 5,         // 最大推荐数量
    priority: {
      tagMatch: 10,      // 标签匹配权重（最高）
      categoryMatch: 5,  // 分类匹配权重
      highViews: 3,      // 高浏览量权重
      recentDate: 2,     // 最近发布权重
    },
    minViews: 100,       // 最低浏览量阈值
  },
}
```

**推荐算法说明：**
- **标签匹配**：优先推荐有相同标签的文章（权重最高）
- **分类匹配**：其次推荐同分类的文章
- **浏览量**：高浏览量文章获得额外加分
- **发布时间**：最近发布的文章获得加分
- **智能过滤**：低于浏览量阈值的文章得分会降低

## 🔒 环境变量配置

### Notion 数据库属性映射

```typescript
envConfig: {
  notion: {
    // 数据库属性映射（根据你的实际数据库结构调整）
    properties: {
      title: "标题",           // 文章标题字段
      description: "期数",     // 文章描述字段
      category: "类型",        // 分类字段
      tags: "标签",           // 标签字段
      image: "封面",          // 图片字段
      views: "评分",          // 浏览量字段
      likes: "热门资源",      // 点赞数字段
      date: "创建时间",       // 日期字段
      url: "网盘1",           // 链接字段
      status: "Published",    // 状态字段
    },
    // 数据获取配置
    fetch: {
      pageSize: 100,        // Notion API 每页最大数量
      maxRetries: 3,        // 最大重试次数
      retryDelay: 1000,     // 重试延迟（毫秒）
    },
  },
}
```

**数据获取配置说明：**
- **pageSize**: Notion API 每页最大支持 100 条记录，系统会自动分页获取所有文章
- **maxRetries**: 网络请求失败时的最大重试次数，提高数据获取的稳定性
- **retryDelay**: 重试之间的延迟时间（毫秒），避免频繁请求

**重要提示**：如果你的 Notion 数据库字段名称不同，请在这里修改对应的映射关系。

## 📝 配置最佳实践

### 1. 备份配置
- 修改配置前先备份原文件
- 使用版本控制管理配置变更

### 2. 测试配置
- 修改配置后重启开发服务器
- 检查所有页面是否正常显示

### 3. 环境区分
- 开发环境和生产环境可以使用不同的配置
- 敏感信息（如 API 密钥）使用环境变量

### 4. 团队协作
- 配置文件可以提交到代码仓库
- 团队成员可以共享和同步配置

## 🆘 常见问题

### Q: 修改配置后页面没有变化？
A: 请重启开发服务器：`npm run dev`

### Q: 如何添加新的导航菜单项？
A: 在 `navigation.main` 数组中添加新的菜单项

### Q: 如何修改文章卡片的显示样式？
A: 调整 `ui.cards` 配置项

### Q: 如何禁用某个功能？
A: 在 `features` 中设置对应的 `enabled: false`

## 📞 获取帮助

如果遇到配置问题：
1. 检查配置文件语法是否正确
2. 确认所有必需的字段都已配置
3. 查看浏览器控制台是否有错误信息
4. 参考本文档的配置示例

---

**记住**：配置文件是网站的核心，修改时要谨慎，建议先在开发环境测试后再应用到生产环境。
