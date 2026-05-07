"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"

interface NotionStatusProps {
  hasApiKey: boolean
  hasDatabaseId: boolean
  databaseId?: string
  isConnected: boolean
  error?: string
}

export default function NotionStatus({ hasApiKey, hasDatabaseId, databaseId, isConnected, error }: NotionStatusProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getOverallStatus = () => {
    if (isConnected) return { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: "已连接", color: "green" }
    if (!hasApiKey || !hasDatabaseId)
      return { icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, text: "需要配置", color: "yellow" }
    return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: "连接失败", color: "red" }
  }

  const status = getOverallStatus()

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {status.icon}
          Notion 数据源状态
          <Badge
            variant={status.color === "green" ? "default" : status.color === "yellow" ? "secondary" : "destructive"}
          >
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(hasApiKey)}
              <span className="text-sm">API 密钥</span>
            </div>
            <span className="text-xs text-muted-foreground">{hasApiKey ? "已配置" : "未配置"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(hasDatabaseId)}
              <span className="text-sm">数据库 ID</span>
            </div>
            <span className="text-xs text-muted-foreground">{hasDatabaseId ? "已配置" : "未配置"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(isConnected)}
              <span className="text-sm">数据库连接</span>
            </div>
            <span className="text-xs text-muted-foreground">{isConnected ? "正常" : "失败"}</span>
          </div>

          {!isConnected && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">配置指南</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? "收起" : "展开"}
                </Button>
              </div>

              {showDetails && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  {!hasApiKey && (
                    <div>
                      <p className="font-medium text-foreground mb-1">1. 获取 API 密钥：</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          访问{" "}
                          <a
                            href="https://www.notion.so/my-integrations"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            Notion 集成页面 <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>创建新集成并复制 API 密钥</li>
                        <li>在项目设置中添加 NOTION_API_KEY 环境变量</li>
                      </ul>
                    </div>
                  )}

                  {!hasDatabaseId && (
                    <div>
                      <p className="font-medium text-foreground mb-1">2. 设置数据库 ID：</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>打开你的 Notion 数据库页面</li>
                        <li>从 URL 中复制 32 位字符串 ID</li>
                        <li>在项目设置中添加 NOTION_DATABASE_ID 环境变量</li>
                      </ul>
                      {databaseId && (
                        <div className="mt-2 p-2 bg-background rounded border">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono">{databaseId}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(databaseId)}
                              className="h-6 px-2"
                            >
                              {copied ? "已复制" : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {hasApiKey && hasDatabaseId && !isConnected && (
                    <div>
                      <p className="font-medium text-foreground mb-1">3. 共享数据库：</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>在 Notion 数据库页面点击右上角"共享"</li>
                        <li>点击"邀请"并搜索你的集成名称</li>
                        <li>选择集成并设置权限为"可以编辑"</li>
                        <li>点击"邀请"完成共享</li>
                      </ul>
                      {error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                          错误详情: {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
