const CONFIG = {
  // ===== 基础配置 =====
  HEO_HOME_BANNER_ENABLE: true, // 首页横幅启用
  HEO_SITE_CREATE_TIME: "2024-01-01", // 建站日期
  HEO_HOME_POST_COLS: 5, // 首页文章列数（1-5列）

  // ===== 通知栏配置 =====
  HEO_NOTICE_BAR: [
    { title: "欢迎来到现代化博客", url: "/" },
    { title: "探索更多精彩内容", url: "/archive" },
  ],

  // ===== 英雄区配置 =====
  HEO_HERO_ENABLE: true,
  HEO_HERO_TITLE_1: "现代化",
  HEO_HERO_TITLE_2: "博客体验",
  HEO_HERO_TITLE_3: "HEO MODERN",
  HEO_HERO_SUBTITLE: "基于NotionNext的现代化主题",
  HEO_HERO_DESCRIPTION: "融合现代设计理念，提供优雅的阅读体验",

  // ===== 英雄区分类导航 =====
  HEO_HERO_CATEGORY_1: { title: "必看精选", url: "/tag/必看精选" },
  HEO_HERO_CATEGORY_2: { title: "热门文章", url: "/tag/热门文章" },
  HEO_HERO_CATEGORY_3: { title: "最新发布", url: "/tag/最新发布" },

  // ===== 个人信息卡片 =====
  HEO_INFOCARD_ENABLE: true,
  HEO_INFOCARD_GREETINGS: ["你好！欢迎访问", "🚀 现代化设计", "📱 响应式布局", "⚡ 快速加载", "🎨 优雅界面"],

  // ===== 文章列表配置 =====
  HEO_POST_LIST_COVER: true, // 显示文章封面
  HEO_POST_LIST_SUMMARY: true, // 显示文章摘要
  HEO_POST_LIST_IMG_CROSSOVER: false, // 图片交错显示

  // ===== 功能开关 =====
  HEO_WIDGET_LATEST_POSTS: true, // 最新文章
  HEO_WIDGET_ANALYTICS: true, // 统计信息
  HEO_WIDGET_TO_TOP: true, // 回到顶部
  HEO_WIDGET_DARK_MODE: true, // 深色模式
  HEO_WIDGET_TOC: true, // 目录

  // ===== 文章页配置 =====
  HEO_ARTICLE_ADJACENT: true, // 上下篇文章
  HEO_ARTICLE_COPYRIGHT: true, // 版权声明
  HEO_ARTICLE_RECOMMEND: true, // 相关推荐

  // ===== 社交链接 =====
  HEO_SOCIAL_GITHUB: "",
  HEO_SOCIAL_TWITTER: "",
  HEO_SOCIAL_EMAIL: "",

  // ===== 颜色主题 =====
  HEO_PRIMARY_COLOR: "#3b82f6", // 主色调
  HEO_ACCENT_COLOR: "#10b981", // 强调色

  // ===== 页脚配置 =====
  HEO_FOOTER_SHOW_RUNTIME: true, // 显示运行时间
  HEO_FOOTER_RUNTIME_START_DATE: "2024-01-01", // 网站开始运行日期
  HEO_FOOTER_SHOW_SOCIAL_LINKS: true, // 显示社交链接
  HEO_FOOTER_COPYRIGHT: "© 2024 HeoNext Blog. All rights reserved.",
  HEO_FOOTER_ICP: "", // 备案号

  // ===== 侧边栏配置 =====
  HEO_SIDEBAR_SHOW_PROFILE_CARD: true, // 显示个人资料卡
  HEO_SIDEBAR_SHOW_CATEGORY_CARD: true, // 显示分类卡片
  HEO_SIDEBAR_SHOW_TAG_CLOUD: true, // 显示标签云
  HEO_SIDEBAR_SHOW_RECENT_POSTS: true, // 显示最新文章
  HEO_SIDEBAR_RECENT_POSTS_COUNT: 5, // 最新文章数量

  // ===== 社交链接数组 =====
  HEO_FOOTER_SOCIAL_LINKS: [
    { name: "GitHub", url: "", icon: "fab fa-github" },
    { name: "Twitter", url: "", icon: "fab fa-twitter" },
    { name: "Email", url: "", icon: "fas fa-envelope" },
  ],

  // ===== 其他配置 =====
  HEO_LOADING_COVER: true, // 页面加载遮罩动画
  HEO_RANDOM_POST_ENABLE: true, // 随机文章功能
  HEO_CATEGORY_BAR_ENABLE: true, // 分类栏启用
}

export default CONFIG
