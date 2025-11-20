# 🚀 部署到 Vercel 指南

本项目是基于 Next.js 构建的，非常适合部署到 [Vercel](https://vercel.com)。

## 📋 准备工作

在开始之前，请确保你已经：
1. 注册了 [GitHub](https://github.com) 账号
2. 注册了 [Vercel](https://vercel.com) 账号（推荐使用 GitHub 登录）
3. 准备好你的 Notion API Key 和 Database ID

## 🛠 第一步：提交代码到 GitHub

由于你目前还没有初始化 Git 仓库，请按照以下步骤操作：

1. **初始化 Git 仓库**
   打开终端（Terminal），运行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **创建 GitHub 仓库**
   - 登录 GitHub，点击右上角的 "+" -> "New repository"
   - 输入仓库名称（例如 `lindx-blog`）
   - 选择 "Public" 或 "Private"（建议 Private 以保护代码）
   - 点击 "Create repository"

3. **推送到 GitHub**
   在 GitHub 创建完仓库后，复制页面上的 "…or push an existing repository from the command line" 下的代码，在终端运行。通常是：
   ```bash
   git branch -M main
   git remote add origin https://github.com/你的用户名/lindx-blog.git
   git push -u origin main
   ```

## ☁️ 第二步：在 Vercel 上部署

1. **导入项目**
   - 登录 Vercel Dashboard
   - 点击 "Add New..." -> "Project"
   - 在 "Import Git Repository" 列表中找到你刚刚创建的 `lindx-blog` 仓库，点击 "Import"

2. **配置项目**
   - **Framework Preset**: 保持默认 (Next.js)
   - **Root Directory**: 保持默认 (`./`)

3. **配置环境变量 (Environment Variables)** ⚠️ **重要**
   展开 "Environment Variables" 选项卡，添加以下变量（与你本地 `.env.local` 中的一致）：

   | Key | Value |
   |-----|-------|
   | `NOTION_API_KEY` | `secret_xxxxxxxx...` (你的 Notion Integration Token) |
   | `NOTION_DATABASE_ID` | `xxxxxxxx...` (你的 Database ID) |

   *注意：不要添加 `NEXT_PUBLIC_` 前缀，除非你明确需要在客户端暴露它们（本项目不需要）。*

4. **点击 Deploy**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 1-2 分钟）

## 🎉 部署成功！

部署完成后，Vercel 会分配一个免费域名给你（例如 `lindx-blog.vercel.app`）。你可以点击预览图访问你的网站。

## 🔄 后续更新

以后你只需要在本地修改代码，然后推送到 GitHub：

```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 会自动检测到代码变更并触发重新部署。

## ⚠️ 注意事项

1. **图片加载问题**
   由于 Notion 图片链接有时效性（1小时），我们已经将项目配置为 `force-dynamic`（强制动态渲染）。这意味着 Vercel 每次都会实时请求 Notion 获取最新链接，确保图片正常显示。这会消耗一定的 Vercel Serverless Function 执行时间（免费版有额度限制，但个人博客通常够用）。

2. **自定义域名**
   如果你有自己的域名，可以在 Vercel 项目设置的 "Domains" 中绑定。
