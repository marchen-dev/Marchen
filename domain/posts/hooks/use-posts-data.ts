import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import type { PostsParams } from '@base/lib/route-builder'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { postsAtom } from '../atom/postsAtom'
import { postPaginationQuery } from '../queries/post-pagination-query'

export const usePostsData = () => {
  const searchParams = useSearchParams()
  const categoryContent = searchParams.get('category') ?? undefined
  const orderByContent = searchParams.get('orderBy') as PostsParams['orderBy']
  const searchContent = searchParams.get('search') ?? undefined
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      postPaginationQuery({
        category: categoryContent,
        orderBy: orderByContent,
        search: searchContent,
      }),
    )

  useBeforeMounted(() => {
    if (!data) {
      return
    }
    jotaiStore.set(postsAtom, data)
  })

  return {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  }
}
