/**
 * 网站配置文件
 * 所有需要用户配置的信息都集中在这里
 */

export const siteConfig = {
  // ==================== 品牌配置 ====================
  brand: {
    name: "LinX 后期工坊",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    // 品牌色彩
    colors: {
      primary: "#3B82F6",    // blue-500
      secondary: "#8B5CF6",  // purple-500
      accent: "#10B981"      // green-500
    },
    // 品牌标语
    tagline: "资源分享与技术交流",
    slogan: "分享优质的资源、影视应用、学习资料，助力创作者和开发者提升技能"
  },

  // ==================== 基本信息 ====================
  name: "LinX 后期工坊",
  description: "基于 Notion 数据库构建的知识分享平台，专注于优质内容收集与传播",
  // 网站域名 - 请修改为你的实际域名（用于 SEO、sitemap、OpenGraph 等）
  url: "https://www.lindx.top",

  // ==================== SEO 配置 ====================
  seo: {
    enabled: true,
    metadata: {
      title: "LinX 后期工坊",
      titleTemplate: "%s | LinX 后期工坊",
      description: "分享优质的资源、影视应用、学习资料，助力创作者和开发者提升技能",
      keywords: [
        "资源分享",
        "设计资源",
        "开发工具",
        "学习资料",
        "影视后期",
        "Notion",
        "技术博客"
      ],
      author: "LinX",
      siteName: "LinX 后期工坊",
      locale: "zh_CN",
      // OpenGraph 图片
      ogImage: {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "LinX 后期工坊"
      }
    },
    // 搜索引擎验证（可选）
    verification: {
      google: "",
      baidu: "",
      bing: ""
    }
  },

  // ==================== 社交媒体配置 ====================
  social: {
    // 联系邮箱
    email: "contact@linx.com",
    // 社交平台
    platforms: {
      bilibili: {
        name: "哔哩哔哩",
        url: "https://space.bilibili.com/173981850",
        icon: "BilibiliIcon",
        show: true
      },
      xiaohongshu: {
        name: "小红书",
        url: "https://www.xiaohongshu.com/user/profile/5f70aed20000000001002f89",
        icon: "XiaohongshuIcon",
        show: true
      }
    }
  },

  // ==================== 导航菜单配置 ====================
  navigation: {
    main: [
      { name: "首页", href: "/", icon: "Home", visible: true },
      { name: "文章", href: "/articles", icon: "FileText", visible: true },
      { name: "分类", href: "/categories", icon: "Folder", visible: true },
      { name: "标签", href: "/tags", icon: "Tag", visible: true },
      { name: "关于", href: "/about", icon: "Info", visible: true },
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

  // ==================== 页脚配置 ====================
  footer: {
    // 页脚描述
    description: "分享优质的资源、影视应用、学习资料，助力创作者和开发者提升技能",
    // 导航链接
    links: [
      { name: "关于本站", href: "/about" },
      { name: "友情链接", href: "/links" },
      { name: "隐私政策", href: "/privacy" },
      { name: "RSS订阅", href: "/rss" },
    ],
    // 版权信息
    copyright: {
      year: 2024,
      owner: "LinX 后期工坊",
      statement: "Powered by Notion API & Next.js"
    },
    // 是否显示社交媒体链接
    showSocial: true
  },

  // ==================== 页面配置 ====================
  pages: {
    home: {
      // Hero 区域文本
      title: "LinX 后期工坊",
      subtitle: "域名更新了：www.lindx.top，快收藏起来！",
      disclaimer: {
        line1: "声明：分享资源仅供用户交流学习与研究使用，版权归属原版权方所有",
        line2: "若无意中侵犯到您的版权利益，请联系我，第一时间给予处理！"
      },
      featuredCount: 30, // 首页显示的文章数量
      pagination: {
        itemsPerPage: 30, // 每页显示的文章数量
        showPageInfo: true, // 是否显示分页信息
        showQuickJump: true, // 是否显示快速跳转
      },
      // 网格布局配置
      grid: {
        columns: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        gap: "gap-6",
      },
    },
    articles: {
      itemsPerPage: 30,
      sortOptions: [
        { value: "newest", label: "最新" },
        { value: "oldest", label: "最旧" },
        { value: "popular", label: "最热" },
      ],
      grid: {
        columns: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
        gap: "gap-6",
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

  // ==================== UI 配置 ====================
  ui: {
    theme: {
      primary: "blue",
      secondary: "purple",
      accent: "green",
    },
    layout: {
      maxWidth: "7xl",
      containerPadding: "px-4 sm:px-6 lg:px-8",
    },
    cards: {
      imageAspectRatio: "aspect-video",
      hoverEffect: true,
      showStats: true,
    },
  },

  // ==================== 性能优化配置 ====================
  performance: {
    // 图片优化
    images: {
      lazy: true,              // 懒加载
      placeholder: "blur",     // 占位符
      quality: 75,             // 默认质量
      formats: ["avif", "webp"] // 支持格式
    },
    // 缓存配置（秒）
    cache: {
      staticAssets: 31536000,  // 静态资源缓存（1年）
      apiData: 300,            // API数据缓存（5分钟）
    },
    // 预加载
    prefetch: {
      enabled: true,
      priority: ["articles"]   // 优先预加载的页面
    }
  },

  // ==================== 通知配置 ====================
  notifications: {
    enabled: true,
    // 横幅通知
    banner: {
      show: true,
      type: "info",        // info | warning | success | error
      message: "博主正在后台更新中...",
      dismissible: true,   // 是否可关闭
      icon: true           // 是否显示图标
    }
  },

  // ==================== 功能配置 ====================
  features: {
    // 评论系统
    comments: {
      enabled: false,
      provider: "disqus",  // disqus | giscus | utterances
      config: {}
    },
    // 统计分析
    analytics: {
      enabled: true,
      provider: "supabase", // google | umami | supabase
      trackingId: ""
    },
    // 搜索功能
    search: {
      enabled: true,
      provider: "local",    // local | algolia
      highlightResults: true,
      filters: {
        category: true,
        tag: true,
        date: true,
      },
    },
    // RSS订阅
    rss: {
      enabled: true,
      feedUrl: "/feed.xml"
    },
    // 分类管理配置
    categoryManagement: {
      enabled: true,
      filter: {
        enabled: true,
        showAllButton: true,
        maxVisible: 15,
        visibility: {
          mode: "custom",
          custom: {
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
            hide: [
              "脚本",
              "样机"
            ],
          },
          order: [
            "视频",
            "软件",
            "三维",
            "平面",
            "音频",
            "插件"
          ],
        },
        styling: {
          buttonSize: "md",
          buttonVariant: "default",
          colors: {
            active: "green",
            inactive: "slate",
            hover: "emerald",
          },
          showCount: false,
          responsive: true,
        },
        advanced: {
          enableSearch: false,
          enableGrouping: false,
          enableFavorites: false,
          enableHistory: false,
        },
      },
    },
  },

  // ==================== 内容配置 ====================
  content: {
    categories: {
      defaultColor: "blue",
      showCount: true,
      showRecent: true,
    },
    tags: {
      defaultColor: "gray",
      showCount: true,
      maxDisplay: 5,
    },
    articles: {
      excerptLength: 120,
      showDate: true,
      showAuthor: false,
      showReadingTime: false,
    },
    relatedArticles: {
      maxCount: 5,
      priority: {
        tagMatch: 10,
        categoryMatch: 5,
        highViews: 3,
        recentDate: 2,
      },
      minViews: 100,
    },
  },

  // ==================== 调试配置 ====================
  debug: {
    // 仅在开发环境启用
    enabled: process.env.NODE_ENV === "development",
    // 显示配置信息
    showConfig: false,
    // 显示性能指标
    showPerformance: false,
    // 日志级别
    logLevel: "info" // error | warn | info | debug
  },

  // ==================== 部署配置 ====================
  deployment: {
    platform: "vercel",
    environment: "production",
  },

  // ==================== 维护配置 ====================
  maintenance: {
    enabled: false,
    message: "网站正在维护中，请稍后再试...",
    allowedIPs: [],
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
    apiKey: process.env.NOTION_API_KEY || "",
    databaseId: process.env.NOTION_DATABASE_ID || "",
    // 数据库属性映射（根据你的实际数据库结构调整）
    properties: {
      title: "标题",
      description: "期数",
      content: "期数",
      format: "格式",
      category: "类型",
      tags: "标签",
      image: "封面",
      views: "评分",
      likes: "热门资源",
      date: "创建时间",
      url: "网盘1",
      status: "Published",
    },
    // 数据获取配置
    fetch: {
      pageSize: 100,
      maxRetries: 3,
      retryDelay: 1000,
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
