# 🔧 故障排除指南

## 🚨 常见错误及解决方案

### 错误 1: `Could not find database with ID: xxx`

**错误描述：**
```
@notionhq/client warn: request fail Could not find database with ID: xxx
❌ Database access failed: 数据库未与集成共享或不存在
```

**原因分析：**
1. 数据库未与 Notion 集成共享
2. 数据库ID格式错误
3. 环境变量未正确配置

**解决步骤：**

#### 步骤 1: 检查环境变量
确保 `.env.local` 文件存在且包含正确的配置：

```bash
# 检查文件是否存在
ls -la .env.local

# 如果文件不存在，运行设置脚本
npm run setup
```

#### 步骤 2: 验证数据库ID格式
正确的数据库ID格式应该是：
- 32个字符的十六进制字符串
- 或者标准的UUID格式：`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**获取正确的数据库ID：**
1. 打开你的 Notion 数据库页面
2. 从URL中复制数据库ID部分
3. 确保复制的是完整的ID，不要包含其他字符

#### 步骤 3: 共享数据库（关键步骤）
1. **打开数据库页面**：在 Notion 中打开你的数据库
2. **点击共享按钮**：点击页面右上角的 "Share" 按钮
3. **邀请集成**：点击 "Invite" 按钮
4. **搜索集成**：在搜索框中输入你创建的集成名称
5. **设置权限**：选择你的集成，确保权限设置为 "Can edit"（可以编辑）
6. **完成邀请**：点击 "Invite" 完成共享

#### 步骤 4: 验证集成设置
1. 访问 [Notion 集成页面](https://www.notion.so/my-integrations)
2. 确认你的集成状态为 "Active"
3. 检查集成是否在正确的工作区中

### 错误 2: `Unauthorized` 或 `Invalid API key`

**错误描述：**
```
@notionhq/client warn: request fail Unauthorized
❌ API密钥无效或权限不足
```

**解决方案：**
1. 检查 `NOTION_API_KEY` 是否以 `secret_` 开头
2. 确认API密钥没有多余的空格或换行符
3. 验证集成是否仍然有效
4. 重新生成API密钥

### 错误 3: 环境变量未加载

**错误描述：**
```
⚠️  NOTION_API_KEY is not set. Using fallback data.
⚠️  NOTION_DATABASE_ID is not set. Using fallback data.
```

**解决方案：**
1. 确认 `.env.local` 文件存在
2. 检查文件内容是否正确
3. 重启开发服务器
4. 确认文件没有被 gitignore 忽略

## 🛠️ 快速修复命令

### 使用自动设置脚本
```bash
# 运行自动设置脚本
npm run setup

# 或者直接运行
node setup-notion.js
```

### 手动创建环境变量文件
```bash
# 创建环境变量文件
touch .env.local

# 编辑文件（使用你喜欢的编辑器）
nano .env.local
# 或者
code .env.local
```

### 检查当前配置
```bash
# 检查环境变量文件
cat .env.local

# 检查 Notion 配置状态
npm run dev
# 查看控制台输出
```

## 📋 检查清单

在解决问题之前，请确认以下项目：

- [ ] 已创建 Notion 集成
- [ ] 已获取正确的API密钥（以 `secret_` 开头）
- [ ] 已获取正确的数据库ID
- [ ] 已创建 `.env.local` 文件
- [ ] 数据库已与集成共享
- [ ] 集成权限设置为 "Can edit"
- [ ] 已重启开发服务器

## 🔍 调试技巧

### 1. 启用详细日志
在 `lib/notion.js` 中添加更多日志输出：

```javascript
console.log("🔍 Debug info:");
console.log("API Key exists:", !!process.env.NOTION_API_KEY);
console.log("Database ID:", process.env.NOTION_DATABASE_ID);
console.log("Formatted ID:", FORMATTED_DATABASE_ID);
```

### 2. 测试API连接
创建一个简单的测试脚本：

```javascript
// test-notion.js
const { Client } = require("@notionhq/client");
require('dotenv').config({ path: '.env.local' });

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function testConnection() {
  try {
    const response = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    console.log("✅ 连接成功！");
    console.log("数据库名称:", response.title[0]?.plain_text);
  } catch (error) {
    console.error("❌ 连接失败:", error.message);
  }
}

testConnection();
```

运行测试：
```bash
node test-notion.js
```

## 📞 获取帮助

如果问题仍然存在：

1. **检查官方文档**：
   - [Notion API 文档](https://developers.notion.com/)
   - [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)

2. **检查项目文档**：
   - [README.md](./README.md)
   - [NOTION_SETUP.md](./NOTION_SETUP.md)

3. **常见问题**：
   - 确认你的 Notion 账户类型支持API集成
   - 检查集成是否在正确的工作区中
   - 验证数据库结构是否符合要求

## ✅ 成功标志

设置成功后，你应该看到：

- 控制台显示：`🔗 Using Notion database ID: xxx`
- 成功获取数据：`✅ Successfully fetched X posts from Notion`
- 页面显示实时数据而不是演示数据
- 没有权限相关的错误信息

---

**记住：** 大多数问题都与数据库共享权限有关。确保你的数据库已与集成正确共享！
