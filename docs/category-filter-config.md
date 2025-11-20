# 分类筛选器配置说明

## 概述

分类筛选器现在支持完全的自定义配置，用户可以通过修改 `config/site.ts` 文件来控制分类的显示、隐藏、排序和样式。

## 配置位置

所有配置都在 `config/site.ts` 文件的 `features.categoryManagement.filter` 部分。

## 主要配置选项

### 1. 基础功能配置

```typescript
filter: {
  enabled: true,           // 是否启用分类筛选器
  showAllButton: true,     // 是否显示"全部"按钮
  maxVisible: 10,          // 最大可见分类数量
}
```

### 2. 分类可见性控制

```typescript
visibility: {
  mode: "show_all",        // 显示模式：show_all | hide_all | custom
  
  // 当 mode 为 "custom" 时的具体配置
  custom: {
    show: [                // 要显示的分类列表
      "视频",
      "软件",
      "三维",
      "平面",
      "音频",
      "其他"
    ],
    hide: [                // 要隐藏的分类列表
      // 可以在这里添加要隐藏的分类名称
    ],
  },
  
  // 分类显示顺序（影响优先级）
  order: [
    "视频",
    "软件", 
    "三维",
    "平面",
    "音频",
    "其他"
  ],
}
```

### 3. 样式配置

```typescript
styling: {
  buttonSize: "sm",        // 按钮大小：sm | md | lg
  buttonVariant: "outline", // 按钮样式：outline | default | ghost
  
  colors: {
    active: "blue",        // 选中状态颜色
    inactive: "gray",      // 未选中状态颜色
    hover: "blue",         // 悬停状态颜色
  },
  
  showCount: true,         // 是否显示分类文章数量
  responsive: true,        // 是否启用响应式布局
}
```

### 4. 高级功能

```typescript
advanced: {
  enableSearch: false,     // 是否在分类筛选器中启用搜索
  enableGrouping: false,   // 是否启用分类分组
  enableFavorites: false,  // 是否启用用户收藏分类
  enableHistory: false,    // 是否记录用户筛选历史
}
```

## 使用示例

### 示例1：只显示特定分类

```typescript
visibility: {
  mode: "custom",
  custom: {
    show: ["视频", "软件", "三维"],
    hide: [],
  },
  order: ["视频", "软件", "三维"],
}
```

### 示例2：隐藏特定分类

```typescript
visibility: {
  mode: "custom", 
  custom: {
    show: [], // 空数组表示显示所有分类
    hide: ["其他", "测试"], // 隐藏这些分类
  },
  order: ["视频", "软件", "三维", "平面", "音频"],
}
```

### 示例3：自定义样式

```typescript
styling: {
  buttonSize: "md",
  buttonVariant: "default",
  colors: {
    active: "green",
    inactive: "slate", 
    hover: "emerald",
  },
  showCount: false,
}
```

## 配置生效

修改配置文件后，需要重启开发服务器或重新构建项目才能生效。

## 注意事项

1. **分类名称匹配**：配置中的分类名称必须与数据库中的分类名称完全一致
2. **颜色类名**：颜色配置使用 Tailwind CSS 的颜色类名
3. **响应式设计**：当分类数量超过 `maxVisible` 时，会自动显示展开/收起按钮
4. **性能考虑**：建议 `maxVisible` 不要设置过大，以保持良好的用户体验

## 故障排除

### 分类不显示
- 检查 `enabled` 是否为 `true`
- 检查分类名称是否与数据库中的完全一致
- 检查 `visibility.mode` 设置

### 样式不生效
- 检查颜色类名是否正确
- 确保 Tailwind CSS 已正确配置
- 检查浏览器控制台是否有错误

### 排序不正确
- 检查 `visibility.order` 数组中的分类名称
- 确保所有要排序的分类都在 `order` 数组中
