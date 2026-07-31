/**
 * 简单的内存速率限制工具
 * 适用于 Vercel Serverless 环境
 * 注意：每个 Serverless 函数实例都有独立的内存，因此这个限制是针对单个实例的
 */

interface RateLimitConfig {
    interval: number // 时间窗口（毫秒）
    maxRequests: number // 最大请求数
}

interface RequestRecord {
    count: number
    resetTime: number
}

// 存储请求记录的 Map
const requestStore = new Map<string, RequestRecord>()

// 定期清理过期记录
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, record] of requestStore.entries()) {
            if (now > record.resetTime) {
                requestStore.delete(key)
            }
        }
    }, 60000) // 每分钟清理一次
}

/**
 * 速率限制检查
 * @param identifier 标识符（通常是 IP 地址）
 * @param config 速率限制配置
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now()
    const record = requestStore.get(identifier)

    // 如果没有记录或记录已过期，创建新记录
    if (!record || now > record.resetTime) {
        const newRecord: RequestRecord = {
            count: 1,
            resetTime: now + config.interval,
        }
        requestStore.set(identifier, newRecord)

        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: newRecord.resetTime,
        }
    }

    // 检查是否超过限制
    if (record.count >= config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: record.resetTime,
        }
    }

    // 增加计数
    record.count++
    requestStore.set(identifier, record)

    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - record.count,
        reset: record.resetTime,
    }
}

/**
 * 从请求对象获取 IP 地址
 */
export function getClientIp(request: Request): string {
    // Vercel 提供的 IP 地址在这些 header 中
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    // 后备方案
    return 'unknown'
}

/**
 * 预定义的速率限制配置
 */
export const rateLimitConfigs = {
    view: {
        interval: 60000, // 1 分钟
        maxRequests: 60, // 60 次请求
    },
    like: {
        interval: 60000, // 1 分钟
        maxRequests: 30, // 30 次请求
    },
    stats: {
        interval: 60000, // 1 分钟
        maxRequests: 100, // 100 次请求（批量查询）
    },
    imageUrl: {
        interval: 60000, // 1 分钟
        maxRequests: 120, // 120 次请求（图片 URL 过期时按需换新，一屏可能有几十张图并发自愈）
    },
} as const
