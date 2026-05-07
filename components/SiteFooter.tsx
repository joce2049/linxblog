import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BilibiliIcon, XiaohongshuIcon } from '@/components/SocialIcons'
import { siteConfig } from '@/config/site'

/**
 * 全站 footer。挂在 layout.tsx 上，所有页面共用。
 * 设计规范见 design-system/MASTER.md §6 / §7。
 */
export default function SiteFooter() {
    const social = siteConfig.social.platforms

    return (
        <footer className="glass border-0 mt-16">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    {/* 品牌区 */}
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="brand-logo-mark w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-lg">L</span>
                        </div>
                        <div className="text-left">
                            <span className="brand-logo-text font-bold text-xl">
                                {siteConfig.brand.name}
                            </span>
                            <div className="text-xs text-muted-foreground">
                                {siteConfig.brand.tagline}
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 max-w-3xl mx-auto">
                        {siteConfig.footer.description}
                    </p>

                    {/* 社交按钮 */}
                    <div className="flex justify-center space-x-3 mb-5">
                        {social.bilibili.show && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-muted-foreground hover:bg-accent hover:text-primary"
                                asChild
                            >
                                <a
                                    href={social.bilibili.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.bilibili.name}
                                >
                                    <BilibiliIcon className="w-5 h-5" />
                                </a>
                            </Button>
                        )}
                        {social.xiaohongshu.show && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500"
                                asChild
                            >
                                <a
                                    href={social.xiaohongshu.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.xiaohongshu.name}
                                >
                                    <XiaohongshuIcon className="w-5 h-5" />
                                </a>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-muted-foreground hover:bg-accent hover:text-primary"
                            asChild
                        >
                            <a href={`mailto:${siteConfig.social.email}`} aria-label="邮件联系">
                                <Mail className="w-5 h-5" />
                            </a>
                        </Button>
                    </div>

                    {/* 链接区 */}
                    <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                        {siteConfig.footer.links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-primary transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* 版权 */}
                    <div className="text-center text-xs text-muted-foreground">
                        <p>
                            &copy; {siteConfig.footer.copyright.year}{' '}
                            {siteConfig.footer.copyright.owner}.{' '}
                            {siteConfig.footer.copyright.statement}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
