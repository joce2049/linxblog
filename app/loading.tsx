import PageLoading from '@/components/PageLoading'

// 路由切换 / 服务端渲染期间的全局加载态，避免白屏卡顿
export default function Loading() {
  return <PageLoading />
}
