import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import { useInfiniteQuery } from '@tanstack/react-query'

import { postsAtom } from '../atom/postsAtom'
import { postPaginationQuery } from '../queries/post-pagination-query'
import { usePostsSearchParams } from './use-posts-params'

export const usePostsData = () => {
  const { category, orderBy, search } = usePostsSearchParams()
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      postPaginationQuery({
        category,
        orderBy,
        search,
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
