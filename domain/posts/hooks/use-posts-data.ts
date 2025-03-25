import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import type { PostsParams } from '@base/lib/route-builder'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { postsAtom } from '../atom/postsAtom'
import { postPaginationQuery } from '../queries/post-pagination-query'

export const usePostsData = () => {
  const searchParams = useSearchParams()
  const categoryParams = searchParams.get('category') ?? undefined
  const orderByParams = searchParams.get('orderBy') as PostsParams['orderBy']
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      postPaginationQuery({
        category: categoryParams,
        orderBy: orderByParams,
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
