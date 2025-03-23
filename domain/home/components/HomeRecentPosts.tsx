'use client'

import { routerBuilder, Routes } from '@base/lib/route-builder'
import { m } from 'framer-motion'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { HomeLayout } from './shared/HomeLayout'
import { PostItem } from './shared/PostItem'

export const HomeRecentPosts = () => {
  const posts = useAggregationDataSelector((state) => state?.post)

  return (
    <HomeLayout
      title="最新文章"
      icon="icon-[mingcute--history-line]"
      href={routerBuilder(Routes.POSTS)}
      id="home-scroll-target"
    >
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {posts?.map((post) => (
          <m.li key={post.id}>
            <PostItem post={post} />
          </m.li>
        ))}
      </ul>
    </HomeLayout>
  )
}
