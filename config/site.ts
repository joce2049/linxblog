/**
 * 网站配置文件
 * 所有需要用户配置的信息都集中在这里
 */

export const siteConfig = {
  // 基本信息
  name: "LinX 后期工坊",
  description: "基于 Notion 数据库构建的知识分享平台，专注于优质内容收集与传播",
  url: "https://your-domain.com",
  
  // 联系信息
  contact: {
    email: "contact@linx.com",
    github: "https://github.com/linx",
    twitter: "https://twitter.com/linx",
    wechat: "your-wechat-id",
  },
  
  // 社交媒体链接
  social: {
    github: "https://github.com/linx",
    twitter: "https://twitter.com/linx",
    weibo: "https://weibo.com/linx",
    bilibili: "https://space.bilibili.com/linx",
  },
  
                // 导航菜单配置
              navigation: {
                main: [
                  { name: "首页", href: "/", icon: "Home", visible: true },
                  { name: "文章", href: "/articles", icon: "FileText", visible: true },
                  { name: "分类", href: "/categories", icon: "Folder", visible: true },
                  { name: "标签", href: "/tags", icon: "Tag", visible: true },
                  { name: "关于", href: "/about", icon: "Info", visible: true },
                ],
                footer: [
                  { name: "关于本站", href: "/about" },
                  { name: "友情链接", href: "/links" },
                  { name: "隐私政策", href: "/privacy" },
                  { name: "RSS订阅", href: "/rss" },
                ],
                // 导航栏配置
                config: {
                  showSearch: true,           // 是否显示搜索框
                  showUserMenu: false,        // 是否显示用户菜单
                  showLanguageSwitch: false,  // 是否显示语言切换
                  enableSubmenu: true,        // 是否启用二级菜单
                  mobileBreakpoint: "md",     // 移动端断点
                },
              },
  
  // 页面配置
  pages: {
    home: {
      heroTitle: "发现优质资源，提升创作效率",
      heroSubtitle: "基于 Notion 数据库构建的知识分享平台",
      featuredCount: 30, // 首页显示的文章数量
      pagination: {
        itemsPerPage: 30, // 每页显示的文章数量
        showPageInfo: true, // 是否显示分页信息
        showQuickJump: true, // 是否显示快速跳转
      },
      // 网格布局配置
      grid: {
        columns: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", // 响应式列数
        gap: "gap-6", // 网格间距
      },
    },
    articles: {
      itemsPerPage: 30, // 每页显示的文章数量
      sortOptions: [
        { value: "newest", label: "最新" },
        { value: "oldest", label: "最旧" },
        { value: "popular", label: "最热" },
      ],
      // 网格布局配置
      grid: {
        columns: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5", // 响应式列数
        gap: "gap-6", // 网格间距
      },
    },
    search: {
      placeholder: "输入关键词搜索资源...",
      suggestions: [
        "尝试使用更简单的关键词",
        "检查拼写是否正确",
        "使用分类或标签筛选",
      ],
    },
  },
  
  // UI 配置
  ui: {
    theme: {
      primary: "blue",
      secondary: "purple",
      accent: "green",
    },
    layout: {
      maxWidth: "7xl", // Tailwind 的 max-width 类
      containerPadding: "px-4 sm:px-6 lg:px-8",
    },
    cards: {
      imageAspectRatio: "aspect-video",
      hoverEffect: true,
      showStats: true, // 是否显示浏览量、点赞等统计
    },
  },
  
  // 功能配置
  features: {
    // 分类管理配置
    categoryManagement: {
      enabled: true,
      // 分类筛选器功能
      filter: {
        enabled: true,
        showAllButton: true,
        maxVisible: 15, // 显示所有分类
        // 分类可见性控制
        visibility: {
          mode: "custom", // show_all | hide_all | custom
          // 当 mode 为 "custom" 时的具体配置
          custom: {
            // 要显示的分类（优先级从高到低）
            show: [
              "视频",
              "软件",
              "三维", 
              "平面",
              "音频",
              "插件", 
              "LUT",
              "AIGC"
            ],
            // 要隐藏的分类
            hide: [
              "脚本",
              "样机"
            ],
          },
          // 分类显示顺序（影响优先级）
          order: [
            "视频",
            "软件",
            "三维",
            "平面", 
            "音频"
          ],
        },
        // 样式和交互配置
        styling: {
          buttonSize: "md", // sm | md | lg
          buttonVariant: "default", // outline | default | ghost
          colors: {
            active: "green", // 选中状态颜色
            inactive: "slate", // 未选中状态颜色
            hover: "emerald", // 悬停状态颜色
          },
          showCount: false, // 是否显示分类文章数量
          responsive: true, // 是否启用响应式布局
        },
        // 高级功能
        advanced: {
          enableSearch: false, // 是否在分类筛选器中启用搜索
          enableGrouping: false, // 是否启用分类分组
          enableFavorites: false, // 是否启用用户收藏分类
          enableHistory: false, // 是否记录用户筛选历史
        },
      },
    },
    search: {
      enabled: true,
      highlightResults: true,
      filters: {
        category: true,
        tag: true,
        date: true,
      },
    },
    comments: {
      enabled: false, // 是否启用评论功能
      provider: "disqus", // 评论系统提供商
    },
    analytics: {
      enabled: false, // 是否启用分析统计
      provider: "google", // 分析服务提供商
      trackingId: "", // 跟踪 ID
    },
    seo: {
      enabled: true,
      defaultMeta: {
        title: "LinX后期工坊 - 优质资源分享平台",
        description: "基于 Notion 数据库构建的知识分享平台，专注于优质内容收集与传播",
        keywords: "资源分享,设计资源,开发工具,学习资料,Notion",
      },
    },
  },
  
  // 内容配置
  content: {
    categories: {
      defaultColor: "blue",
      showCount: true,
      showRecent: true,
    },
    tags: {
      defaultColor: "gray",
      showCount: true,
      maxDisplay: 5, // 卡片上最多显示的标签数量
    },
    articles: {
      excerptLength: 120, // 文章摘要长度
      showDate: true,
      showAuthor: false,
      showReadingTime: false,
    },
    // 相关资源推荐配置
    relatedArticles: {
      maxCount: 5, // 最大推荐数量
      priority: {
        tagMatch: 10,      // 标签匹配权重
        categoryMatch: 5,  // 分类匹配权重
        highViews: 3,      // 高浏览量权重
        recentDate: 2,     // 最近发布权重
      },
      minViews: 100,       // 最低浏览量阈值
    },
  },
  
  // 部署配置
  deployment: {
    platform: "vercel", // 部署平台
    environment: "production", // 环境
    cdn: "https://cdn.your-domain.com", // CDN 地址
  },
  
  // 维护配置
  maintenance: {
    enabled: false, // 是否启用维护模式
    message: "网站正在维护中，请稍后再试...",
    allowedIPs: [], // 允许访问的 IP 地址
  },
}

// 类型定义
export type SiteConfig = typeof siteConfig

// 分类筛选器配置类型
export interface CategoryFilterConfig {
  enabled: boolean
  showAllButton: boolean
  maxVisible: number
  visibility: {
    mode: 'show_all' | 'hide_all' | 'custom'
    custom: {
      show: string[]
      hide: string[]
    }
    order: string[]
  }
  styling: {
    buttonSize: 'sm' | 'md' | 'lg'
    buttonVariant: 'outline' | 'default' | 'ghost'
    colors: {
      active: string
      inactive: string
      hover: string
    }
    showCount: boolean
    responsive: boolean
  }
  advanced: {
    enableSearch: boolean
    enableGrouping: boolean
    enableFavorites: boolean
    enableHistory: boolean
  }
}

// 分类管理配置类型
export interface CategoryManagementConfig {
  enabled: boolean
  filter: CategoryFilterConfig
}

// 环境变量配置
export const envConfig = {
  // Notion 配置
  notion: {
    apiKey: process.env.NOTION_API_KEY || "secret_2oBA394pDpOFapIF1UTyoyj1hIBhNeSYit3LDq4O1l2",
    databaseId: process.env.NOTION_DATABASE_ID || "10e560f6a07b8088809cede1dad50457",
    // 数据库属性映射（根据你的实际数据库结构调整）
    properties: {
      title: "标题",
      description: "期数", // 这个字段包含期数信息
      content: "期数", // 用于显示文章内容
      format: "格式", // 文件格式信息
      category: "类型",
      tags: "标签",
      image: "封面",
      views: "评分",
      likes: "热门资源",
      date: "创建时间",
      url: "网盘1", // 备用：网盘2
      status: "Published", // 固定值，因为你的数据库没有状态字段
    },
    // 数据获取配置
    fetch: {
      pageSize: 100, // Notion API 每页最大数量
      maxRetries: 3, // 最大重试次数
      retryDelay: 1000, // 重试延迟（毫秒）
    },
  },

  // 其他环境变量
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
  },
}

// 导出默认配置
export default siteConfig
