export const ARTICLE_STATS_UPDATED_EVENT = 'article-stats-updated'

export interface ArticleStatsUpdateDetail {
    articleId: string
    views: number
    likes: number
}

export function dispatchArticleStatsUpdate(detail: ArticleStatsUpdateDetail) {
    window.dispatchEvent(new CustomEvent<ArticleStatsUpdateDetail>(ARTICLE_STATS_UPDATED_EVENT, {
        detail
    }))
}
