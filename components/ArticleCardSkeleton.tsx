import { Skeleton } from "@/components/ui/skeleton"

export default function ArticleCardSkeleton() {
  return (
    <div className="bg-card border border-border flex flex-col gap-0 py-0 px-0 rounded-xl overflow-hidden">
      {/* 图片占位 */}
      <div className="relative overflow-hidden">
        <Skeleton className="w-full aspect-video" />
      </div>
      
      <div className="p-5">
        {/* 标题占位 */}
        <Skeleton className="h-6 w-3/4 mb-3" />
        
        {/* 描述占位 */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        
        {/* 标签占位 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        
        {/* 统计信息占位 */}
        <div className="flex items-center justify-center space-x-6">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        
        {/* 日期占位 */}
        <div className="mt-4 pt-4">
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}
