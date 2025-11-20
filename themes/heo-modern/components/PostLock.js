"use client"

import { useState } from "react"

/**
 * 文章密码锁组件
 */
export const PostLock = ({ validPassword, setValidPassword }) => {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password.trim()) {
      // 这里应该验证密码的逻辑
      setValidPassword(password)
    } else {
      setError("请输入密码")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">文章已加密</h2>
        <p className="text-gray-600 mb-6">请输入密码查看文章内容</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            解锁文章
          </button>
        </form>
      </div>
    </div>
  )
}
