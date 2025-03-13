'use client'

import { m } from 'framer-motion'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

import { HomeLayout } from './shared/HomeLayout'
import { HomePost } from './shared/HomePost'

export const HomeRecentPosts = () => {
  const { post: posts } = useAggregationData()
  return (
    <HomeLayout title="最新文章" icon="icon-[mingcute--history-line]">
      <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <m.li key={post.id}>
            <HomePost post={post} />
          </m.li>
        ))}
      </ul>
    </HomeLayout>
  )
}
