'use client'

import { cn } from '@base/lib/helper'
import { usePostSelector } from '@domain/posts/atom/selectors/post-selector'
import dayjs from 'dayjs'

export const PostHeader = () => {
  const post = usePostSelector((state) => state)
  return (
    <section>
      <h2 className="my-7 text-2xl font-semibold">{post?.title}</h2>
      <span className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
        <IconWrapper line as="time" icon="icon-[mingcute--time-duration-line]">
          {dayjs(post?.created).format('YYYY 年 M 月 DD 日')}
        </IconWrapper>
        <IconWrapper line icon="icon-[mingcute--eye-line]">
          {post?.read}
        </IconWrapper>
        <IconWrapper line icon="icon-[mingcute--filter-line]">
          {post?.category?.name}
        </IconWrapper>
        <IconWrapper icon="icon-[mingcute--tag-line]">
          {post?.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </IconWrapper>
      </span>
    </section>
  )
}

interface IconWrapperProps {
  children: React.ReactNode
  icon: string
  as?: React.ElementType
  line?: boolean
}

const IconWrapper = ({ children, icon, as, line }: IconWrapperProps) => {
  const Icon = as || 'span'
  return (
    <>
      <Icon className={cn('flex items-center gap-1')}>
        <i className={icon} />
        {children}
      </Icon>
      {line && <span className="mx-2 text-zinc-400">|</span>}
    </>
  )
}
