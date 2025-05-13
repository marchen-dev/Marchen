'use client'

import { apiClient } from '@marchen/api-client'
import { cn, getQueryClient } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { usePostSelector } from '../../atom/selectors/post-selector'

export const PostHeader = () => {
  const params = useParams<{ category?: string; slug: string }>()
  const { category, slug } = params
  const isPost = !!category
  const post = usePostSelector((state) => state)
  const queryClient = getQueryClient()
  const hiddenTags = useMemo(() => {
    if (!post?.tags || post?.tags.length === 0) {
      return true
    }
    return false
  }, [post?.tags])

  //Fixed: 点赞后，需要重新获取文章详情
  const { mutate: likePost } = useMutation({
    mutationFn: () => {
      return apiClient.posts.postLike(post?.id ?? '')
    },
    onSuccess: () => {
      toast.success('点赞成功')
      queryClient.invalidateQueries({
        queryKey: isPost ? ['posts', category, slug] : ['pages', slug],
      })
    },

    onError: () => {
      toast.error('点赞失败')
    },
  })

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
          line={isPost}
          icon="icon-[mingcute--love-line]"
          onClick={() => likePost()}
          // classNames={{ wrapper: 'cursor-pointer' }}
        >
          {post?.likes}
        </IconWrapper>
        {post?.category && (
          <IconWrapper
            line={!hiddenTags}
            classNames={{ line: 'hidden md:block' }}
            icon="icon-[mingcute--filter-line]"
          >
            {post?.category?.name}
          </IconWrapper>
        )}
        {!hiddenTags && (
          <IconWrapper
            icon="icon-[mingcute--tag-line]"
            classNames={{ wrapper: 'hidden md:inline' }}
          >
            {post?.tags?.map((tag) => (
              <span className="mr-0.5" key={tag}>
                {tag}
              </span>
            ))}
          </IconWrapper>
        )}
      </span>
      <AISummary summary={post?.summary} summaryModel={post?.summaryModel} />
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
  onClick?: () => void
}

const IconWrapper = ({
  children,
  icon,
  as,
  line,
  classNames,
  onClick,
}: IconWrapperProps) => {
  const Icon = as || 'span'
  return (
    <div
      className={cn('flex items-center', classNames?.wrapper)}
      onClick={onClick}
    >
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

export interface AISummaryProps {
  summary?: string
  summaryModel?: string
}

const AISummary = ({ summary, summaryModel }: AISummaryProps) => {
  if (!summary) {
    return null
  }
  return (
    <div className="mt-6 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="flex justify-between text-sm font-medium">
        <span className="flex items-center gap-1">
          <i className="icon-[mingcute--ai-line]" />
          <span>AI 总结</span>
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {summaryModel}
        </span>
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-400">
        {summary}
      </p>
    </div>
  )
}
