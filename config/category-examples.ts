/**
 * 分类筛选器配置示例
 * 复制这些配置到 config/site.ts 的 features.categoryManagement.filter 部分
 */

// 示例1：只显示核心分类
export const coreCategoriesOnly = {
  visibility: {
    mode: "custom" as const,
    custom: {
      show: ["视频", "软件", "三维", "平面"],
      hide: [],
    },
    order: ["视频", "软件", "三维", "平面"],
  },
}

// 示例2：隐藏特定分类
export const hideSpecificCategories = {
  visibility: {
    mode: "custom" as const,
    custom: {
      show: [], // 空数组表示显示所有分类
      hide: ["其他", "测试"], // 隐藏这些分类
    },
    order: ["视频", "软件", "三维", "平面", "音频"],
  },
}

// 示例3：自定义样式 - 绿色主题
export const greenTheme = {
  styling: {
    buttonSize: "md" as const,
    buttonVariant: "default" as const,
    colors: {
      active: "green",
      inactive: "slate",
      hover: "emerald",
    },
    showCount: true,
    responsive: true,
  },
}

// 示例4：紧凑布局
export const compactLayout = {
  maxVisible: 6,
  styling: {
    buttonSize: "sm" as const,
    buttonVariant: "outline" as const,
    colors: {
      active: "blue",
      inactive: "gray",
      hover: "blue",
    },
    showCount: false,
    responsive: true,
  },
}

// 示例5：高级功能启用
export const advancedFeatures = {
  advanced: {
    enableSearch: true,
    enableGrouping: true,
    enableFavorites: true,
    enableHistory: true,
  },
}

// 完整配置示例
export const completeExample = {
  enabled: true,
  showAllButton: true,
  maxVisible: 8,
  visibility: {
    mode: "custom" as const,
    custom: {
      show: ["视频", "软件", "三维", "平面", "音频"],
      hide: ["其他"],
    },
    order: ["视频", "软件", "三维", "平面", "音频"],
  },
  styling: {
    buttonSize: "md" as const,
    buttonVariant: "outline" as const,
    colors: {
      active: "blue",
      inactive: "gray",
      hover: "blue",
    },
    showCount: true,
    responsive: true,
  },
  advanced: {
    enableSearch: false,
    enableGrouping: false,
    enableFavorites: false,
    enableHistory: false,
  },
}
