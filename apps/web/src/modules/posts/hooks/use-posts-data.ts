import { jotaiStore } from '@marchen/atom'
import { useBeforeMounted } from '@marchen/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'

import { postsAtom } from '../atom/postsAtom'
import { postsPaginationQuery } from '../queries/posts-pagination-query'
import { usePostsSearchParams } from './use-posts-params'

export const usePostsData = () => {
  const { category, orderBy, search } = usePostsSearchParams()
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      postsPaginationQuery({
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
