'use client'

import { m } from 'framer-motion'
import Image from 'next/image'

// Animation variants
const fadeInVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export const HomeRecentPosts = () => {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInVariants}
    >
      <h2 className="flex items-center gap-1 text-xl font-medium">
        <i className="icon-[mingcute--history-line] text-2xl" />
        最新文章
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
        <li>
          <PostCard />
        </li>
      </ul>
    </m.div>
  )
}

const content =
  '对于学习 TypeScript 了解类型的逆变、协变、双向协变和不变是很重要的，但你只要明白类型的父子级关系，这些概念理解起来就会容易许多，因此在讲述这些之前我们必须先学会类型的父子级关系。'
export const PostCard = () => {
  const num = Math.floor(Math.random() * (5 - 1 + 1)) + 1
  return (
    <div className=" rounded-2xl border-2 bg-white  drop-shadow-sm">
      <div className="relative h-[155px]">
        <Image src={`/${num}.jpg`} fill className="object-cover" alt="cover" />
      </div>
      <div className="space-y-4 p-3">
        <h4 className="text-lg font-medium">迟来的 2023 年度总结</h4>
        <p>{content.slice(0, 50)}...</p>
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-1 font-medium">
            <i className="icon-[mingcute--tag-2-line] text-sm" />
            <span>Java</span>
            <span>Spring</span>
            <span>后端</span>
          </div>
          <time className="flex items-center gap-1 text-sm">
            <i className="icon-[mingcute--time-duration-line] text-lg" />
            2023-11-06
          </time>
        </div>
      </div>
    </div>
  )
}
