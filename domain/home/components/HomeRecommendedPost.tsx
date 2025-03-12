'use client'
import { HomeCard } from '@base/components/ui/Card'
import { useIsMobile } from '@base/hooks/use-mobile'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

import { HomePost } from './shared/HomePost'

export const HomeRecommendedPost = () => {
  const { post } = useAggregationData()
  const isMobile = useIsMobile()
  const latestPost = post[0]
  if (!latestPost) {
    return (
      <div className="col-span-2 size-full xl:col-span-3">
        <HomeCard className="flex size-full items-center justify-center">
          <p className="text-lg text-gray-500">暂无推荐文章</p>
        </HomeCard>
      </div>
    )
  }
  return (
    <div className="col-span-2 size-full min-h-64 xl:col-span-3">
      <HomePost
        layout={isMobile ? 'vertical' : 'horizontal'}
        post={latestPost}
      />
    </div>
  )
}
