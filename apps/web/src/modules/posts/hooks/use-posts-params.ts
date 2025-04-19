'use client'

import type { PostsParams } from '@marchen/lib'
import { useSearchParams } from 'next/navigation'

export const usePostsSearchParams = () => {
  const searchParams = useSearchParams()
  const categoryContent = searchParams.get('category') ?? undefined
  const orderByContent = searchParams.get('orderBy') as PostsParams['orderBy']
  const searchContent = searchParams.get('search') ?? undefined

  return {
    category: categoryContent,
    orderBy: orderByContent,
    search: searchContent,
  }
}
