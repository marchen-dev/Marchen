'use client'

import { AnimatePresence, m } from 'framer-motion'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

import { HomeFadeInVariants } from '../lib/home-motion'
import { HomePost } from './shared/HomePost'

export const HomeRecentPosts = () => {
  const { post: posts } = useAggregationData()
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={HomeFadeInVariants}
      className="pb-8"
    >
      <m.h2
        className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text pb-1 text-2xl font-bold text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <m.i
          className="icon-[mingcute--history-line] text-3xl text-blue-400"
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 5,
          }}
        />
        最新文章
      </m.h2>
      <m.div
        className="mb-6 mt-1 h-1 w-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 80, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
      <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {posts.map((post, index) => (
            <m.li
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <HomePost post={post} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </m.div>
  )
}
