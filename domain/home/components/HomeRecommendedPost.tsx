'use client'
import { useAggregationData } from '~/providers/root/AggregationDataProvider'

import { HomePost } from './shared/HomePost'

export const HomeRecommendedPost = () => {
  const { post } = useAggregationData()
  return (
    <div className="col-span-2 size-full xl:col-span-3">
      <HomePost layout="horizontal" post={post[0]} />
    </div>
  )
}
