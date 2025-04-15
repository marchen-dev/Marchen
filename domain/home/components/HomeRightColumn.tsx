'use client'

import { Button } from '@base/components/ui/Button'
import { cn } from '@base/lib/helper'
import { Routes } from '@base/lib/route-builder'
import { m } from 'framer-motion'
import Link from 'next/link'
import type { FC } from 'react'

import { useScrollToPosts } from '../hooks/use-scroll-to-posts'

export const HomeRightColumn = () => {
  const { handleScrollToPosts } = useScrollToPosts()
  return (
    <m.div
      className="flex flex-col gap-6 lg:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <m.div
        className="grid w-full grid-cols-2 overflow-hidden rounded-xl border border-base-300 bg-primary shadow-sm dark:border-zinc-700"
        variants={gridVariants}
      >
        {homeSiteDataConfig.map((item, index) => (
          <HomeSiteAnalysisItem key={item.title} {...item} position={index} />
        ))}
      </m.div>
      <m.div
        className="mt-8 flex justify-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Button
          variant="outline"
          className="rounded-xl  px-7 py-5 text-lg font-medium text-zinc-600 shadow-sm  dark:text-white"
          onClick={handleScrollToPosts}
        >
          <i className="icon-[mingcute--large-arrow-down-line] mr-1 text-xl" />
          滚动浏览
        </Button>
        <Button
          variant="outline"
          className="rounded-xl  bg-blue-400 px-7 py-5 text-lg font-medium text-base-100 shadow-sm hover:bg-blue-500 hover:text-base-100"
          asChild
        >
          <Link href={Routes.POSTS}>
            文章列表
            <i className="icon-[mingcute--folder-open-line] ml-1 text-xl" />
          </Link>
        </Button>
      </m.div>
    </m.div>
  )
}

interface HomeSiteAnalysisItemProps {
  title: string
  value: number
  icon: string
  position?: number
  color: string
}

const HomeSiteAnalysisItem: FC<HomeSiteAnalysisItemProps> = ({
  title,
  value,
  icon,
  color,
  position = 0,
}) => {
  // 根据位置决定边框样式：
  // 0(左上): 右边和下边有边框
  // 1(右上): 下边有边框
  // 2(左下): 右边有边框
  // 3(右下): 无边框
  const getBorderClass = () => {
    switch (position) {
      case 0: {
        // 左上
        return 'border-r border-b border-base-300 dark:border-zinc-700'
      }
      case 1: {
        // 右上
        return 'border-b border-base-300 dark:border-zinc-700'
      }
      case 2: {
        // 左下
        return 'border-r border-base-300 dark:border-zinc-700'
      }
      case 3: {
        // 右下
        return ''
      }
      default: {
        return ''
      }
    }
  }

  return (
    <m.div
      className={cn('flex justify-between p-4 py-6', getBorderClass())}
      variants={itemVariants}
      custom={position}
      initial="hidden"
      animate="visible"
      whileHover={{ backgroundColor: `${color}20` }}
    >
      <div>
        <p className="font-medium text-zinc-500">{title}</p>
        <m.p
          className="mt-3 text-3xl font-bold"
          style={{ color }}
          variants={valueVariants}
          custom={position}
        >
          {value}
        </m.p>
      </div>

      <div
        className="flex size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}20` }}
      >
        <i className={cn(icon, 'text-3xl')} style={{ color }} />
      </div>
    </m.div>
  )
}

const homeSiteDataConfig = [
  {
    title: '文章',
    value: 100,
    icon: 'icon-[mingcute--book-6-line]',
    color: '#60a5fa',
  },
  {
    title: '在线访客',
    value: 3,
    icon: 'icon-[mingcute--user-4-line]',
    color: '#34d399',
  },
  {
    title: '点赞数',
    value: 521,
    icon: 'icon-[mingcute--thumb-up-line]',
    color: '#f87171',
  },
  {
    title: '评论数',
    value: 100,
    icon: 'icon-[mingcute--chat-3-line]',
    color: '#fbbf24',
  },
] satisfies HomeSiteAnalysisItemProps[]

// 定义统一的动画变量
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
}

const gridVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      type: 'spring',
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      delay: 0.08 * custom,
      type: 'spring',
      stiffness: 120,
      damping: 12,
    },
  }),
}

const valueVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: (custom: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.2 + 0.05 * custom,
      type: 'spring',
      stiffness: 150,
      damping: 10,
    },
  }),
}
