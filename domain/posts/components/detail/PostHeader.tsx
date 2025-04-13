'use client'

import { cn } from '@base/lib/helper'
import type { SummaryResponseType } from '@base/services/interfaces/summary.interface'
import { usePostSelector } from '@domain/posts/atom/selectors/post-selector'
import dayjs from 'dayjs'
import { useMemo } from 'react'

export const PostHeader = () => {
  const post = usePostSelector((state) => state)

  const hiddenTags = useMemo(() => {
    if (!post?.tags || post?.tags.length === 0) {
      return true
    }
    return false
  }, [post?.tags])

  return (
    <div>
      <h1 className="my-6 text-2xl font-semibold leading-9">{post?.title}</h1>
      <span className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 ">
        <IconWrapper line as="time" icon="icon-[mingcute--time-duration-line]">
          {dayjs(post?.created).format('YYYY 年 M 月 DD 日')}
        </IconWrapper>
        <IconWrapper line icon="icon-[mingcute--eye-line]">
          {post?.read}
        </IconWrapper>
        <IconWrapper
          line={!hiddenTags}
          classNames={{ line: 'hidden md:block' }}
          icon="icon-[mingcute--filter-line]"
        >
          {post?.category?.name}
        </IconWrapper>
        {!hiddenTags && (
          <IconWrapper
            icon="icon-[mingcute--tag-line]"
            classNames={{ wrapper: 'hidden md:inline' }}
          >
            {post?.tags.map((tag) => (
              <span className="mr-0.5" key={tag}>
                {tag}
              </span>
            ))}
          </IconWrapper>
        )}
      </span>
      <AISummary summary={post?.summary} />
    </div>
  )
}

interface IconWrapperProps {
  children: React.ReactNode
  icon: string
  as?: React.ElementType
  line?: boolean
  classNames?: {
    wrapper?: string
    line?: string
  }
}

const IconWrapper = ({
  children,
  icon,
  as,
  line,
  classNames,
}: IconWrapperProps) => {
  const Icon = as || 'span'
  return (
    <div className={cn('flex items-center', classNames?.wrapper)}>
      <Icon className={cn('flex items-center gap-1')}>
        <i className={icon} />
        {children}
      </Icon>
      {line && (
        <span className={cn('mx-2 text-zinc-400', classNames?.line)}>|</span>
      )}
    </div>
  )
}

interface AISummaryProps {
  summary?: SummaryResponseType
}

const AISummary = ({ summary }: AISummaryProps) => {
  if (!summary) {
    return null
  }
  return (
    <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="flex justify-between text-sm font-medium">
        <span className="flex items-center gap-1">
          <i className="icon-[mingcute--ai-line]" />
          <span> AI 总结</span>
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {summary.model}
        </span>
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-400">
        {summary.text}
      </p>
    </div>
  )
}
