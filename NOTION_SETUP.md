# Notion 集成设置指南

## 🚨 当前问题解决

如果你看到错误：`Could not find database with ID: xxx`，请按以下步骤解决：

### 问题 1: 数据库ID格式错误
你的数据库ID `10e560f6-a07b-8088-809c-ede1dad50457` 可能格式不正确。

**正确的数据库ID格式应该是：**
- 32个字符的十六进制字符串
- 或者标准的UUID格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**获取正确的数据库ID：**
1. 打开你的 Notion 数据库页面
2. 从URL中复制数据库ID部分
3. 确保复制的是完整的ID，不要包含其他字符

### 问题 2: 数据库未与集成共享
这是最常见的问题，需要手动设置权限。

## 📋 完整设置步骤

### 步骤 1: 创建 Notion 集成

1. 访问 [Notion 集成页面](https://www.notion.so/my-integrations)
2. 点击 "New integration"
3. 填写集成名称（如：LinX Blog Integration）
4. 选择关联的工作区
5. 点击 "Submit" 创建集成
6. 复制生成的 API 密钥（以 `secret_` 开头）

### 步骤 2: 设置数据库结构

确保你的数据库包含以下属性：
- **Title** (标题类型) - 文章标题
- **Description** (文本类型) - 文章描述
- **Category** (选择类型) - 文章分类
- **Tags** (多选类型) - 文章标签
- **Image** (文件类型) - 文章封面图片
- **Views** (数字类型) - 浏览量
- **Likes** (数字类型) - 点赞数
- **Comments** (数字类型) - 评论数
- **Created** (创建时间类型) - 创建时间
- **Status** (选择类型) - 状态（Published/Draft）
- **URL** (链接类型) - 文章链接

### 步骤 3: 共享数据库（关键步骤）

1. **打开数据库页面**：在 Notion 中打开你的数据库
2. **点击共享按钮**：点击页面右上角的 "Share" 按钮
3. **邀请集成**：点击 "Invite" 按钮
4. **搜索集成**：在搜索框中输入你创建的集成名称
5. **设置权限**：选择你的集成，确保权限设置为 "Can edit"（可以编辑）
6. **完成邀请**：点击 "Invite" 完成共享

### 步骤 4: 配置环境变量

1. **创建环境变量文件**：
   ```bash
   # 在项目根目录执行
   touch .env.local
   ```

2. **编辑 .env.local 文件**，添加以下内容：
   ```env
   NOTION_API_KEY=secret_your_actual_api_key_here
   NOTION_DATABASE_ID=your_actual_database_id_here
   ```

3. **替换实际值**：
   - 将 `secret_your_actual_api_key_here` 替换为你的实际API密钥
   - 将 `your_actual_database_id_here` 替换为你的实际数据库ID

### 步骤 5: 获取正确的数据库ID

**方法 1: 从URL获取**
```
https://www.notion.so/workspace/10e560f6a07b8088809cede1dad50457?v=...
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              这部分就是数据库ID
```

**方法 2: 从页面属性获取**
1. 在数据库页面按 `Ctrl+Shift+E`（Windows）或 `Cmd+Shift+E`（Mac）
2. 查看页面属性中的数据库ID

### 步骤 6: 测试连接

1. **重启开发服务器**：
   ```bash
   npm run dev
   ```

2. **检查控制台日志**，应该看到：
   ```
   🔗 Using Notion database ID: your_database_id
   [v0] Starting to fetch data from Notion...
   ✅ Successfully fetched X posts from Notion
   ```

## 🔧 故障排除

### 如果仍然出现 "Could not find database" 错误：

1. **检查数据库ID格式**：
   - 确保没有多余的空格或特殊字符
   - 确保是完整的32位ID

2. **检查集成权限**：
   - 确认集成已添加到数据库
   - 确认权限设置为 "Can edit"

3. **检查工作区**：
   - 确保集成和数据库在同一个工作区

4. **检查API密钥**：
   - 确保API密钥以 `secret_` 开头
   - 确保没有多余的空格

### 常见错误及解决方案：

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `Could not find database` | 数据库未共享或ID错误 | 按步骤3共享数据库，检查ID格式 |
| `Unauthorized` | API密钥无效 | 检查API密钥是否正确 |
| `Invalid database ID` | 数据库ID格式错误 | 重新获取正确的数据库ID |

## 📞 获取帮助

如果问题仍然存在：
1. 检查 [Notion API 文档](https://developers.notion.com/)
2. 确认你的 Notion 账户类型支持API集成
3. 检查集成是否在正确的工作区中

## ✅ 成功标志

设置成功后，你应该看到：
- 控制台显示成功连接到Notion
- 页面显示实时数据而不是演示数据
- 没有权限相关的错误信息
