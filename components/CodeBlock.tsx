'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
    code: string
    language: string
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <div className="my-8 rounded-lg overflow-hidden shadow-lg border border-gray-800">
            {/* Header */}
            <div className="bg-gray-800 text-gray-300 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide">{language}</span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors"
                    title="复制代码"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>已复制</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制</span>
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <pre className="bg-gray-950 text-gray-100 p-5 overflow-x-auto text-[14px] leading-[1.7] m-0">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    )
}
