'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 明暗主题切换按钮
 * - 三态循环：light → dark → system → light
 * - 通过 next-themes 控制（已在 layout 里挂载 ThemeProvider）
 */
export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme, resolvedTheme } = useTheme()

    // 避免水合不一致：在客户端 mount 前不渲染图标
    useEffect(() => setMounted(true), [])

    const cycle = () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
    }

    const label = theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色' : '浅色'

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycle}
            className="relative h-9 w-9 rounded-lg hover:bg-accent transition-colors"
            title={`当前：${label}（点击切换）`}
            aria-label={`切换主题，当前为${label}`}
        >
            {!mounted ? (
                // 占位，避免 SSR/CSR 不一致
                <span className="block h-4 w-4" aria-hidden="true" />
            ) : theme === 'system' ? (
                <Monitor className="h-4 w-4 text-foreground/80" />
            ) : resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-foreground/90" />
            ) : (
                <Sun className="h-4 w-4 text-foreground/90" />
            )}
        </Button>
    )
}
