'use client'

import { routerBuilder, Routes } from '@base/lib/route-builder'
import { m } from 'framer-motion'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

import { HomeLayout } from './shared/HomeLayout'
import { HomePost } from './shared/HomePost'

export const HomeRecentPosts = () => {
  const { post: posts } = useAggregationData()

  return (
    <HomeLayout
      title="最新文章"
      icon="icon-[mingcute--history-line]"
      href={routerBuilder(Routes.POSTS)}
    >
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <m.li key={post.id}>
            <HomePost post={post} />
          </m.li>
        ))}
      </ul>
    </HomeLayout>
  )
}
