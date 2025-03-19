'use client'

import { cn } from '@base/lib/helper'
import type { FC } from 'react'

export const HomeSiteAnalysis = () => {
  return (
    <div className="grid w-full grid-cols-4 gap-2 rounded-lg border border-base-300 bg-base-100">
      {homeSiteDataConfig.map((item, index) => (
        <HomeSiteAnalysisItem
          key={item.title}
          {...item}
          last={index === homeSiteDataConfig.length - 1}
        />
      ))}
    </div>
  )
}

interface HomeSiteAnalysisItemProps {
  title: string
  value: number
  icon: string
  last?: boolean
  color: string
}

const HomeSiteAnalysisItem: FC<HomeSiteAnalysisItemProps> = ({
  title,
  value,
  icon,
  color,
  last,
}) => {
  return (
    <>
      <div
        className={cn('flex justify-between p-5 py-6', {
          'border-r border-base-300': !last,
        })}
      >
        <div>
          <p className="text-zinc-500">{title}</p>
          <p className="mt-3 text-2xl font-medium" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="flex items-center">
          <i className={cn(icon, 'text-3xl')} style={{ color }} />
        </div>
      </div>
    </>
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
    icon: 'icon-[mingcute--book-2-line]',
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
