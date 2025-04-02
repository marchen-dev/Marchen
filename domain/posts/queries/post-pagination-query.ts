import type { PostsParams } from '@base/lib/route-builder'
import { apiClient } from '@base/services'
import { infiniteQueryOptions } from '@tanstack/react-query'

export const postPaginationQuery = (params?: Partial<PostsParams>) => {
  const take = params?.take ?? DEFAULT_POST_PAGINATION_PARAMS.take
  const orderBy = params?.orderBy ?? DEFAULT_POST_PAGINATION_PARAMS.orderBy
  const category = params?.category ?? ''
  const search = params?.search
  return infiniteQueryOptions({
    queryKey: ['posts', 'pagination', take, orderBy, category, search],
    queryFn: ({ pageParam }) => {
      let cursor
      if (pageParam !== '0') {
        cursor = pageParam
      }
      return apiClient.posts.get({ take, orderBy, category, cursor, search })
    },
    getNextPageParam: (lastPage) => lastPage.nextId,
    initialPageParam: '0',
  })
}

export const DEFAULT_POST_PAGINATION_PARAMS = {
  take: 12,
  orderBy: 'desc',
} as const
