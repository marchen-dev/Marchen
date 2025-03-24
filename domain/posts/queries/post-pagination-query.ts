import type { PostsParams } from '@base/lib/route-builder'
import { apiClient } from '@base/services'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

export const postPaginationQuery = (params?: Partial<PostsParams>) => {
  const page = params?.page ?? DEFAULT_POST_PAGINATION_PARAMS.page
  const pageSize = params?.pageSize ?? DEFAULT_POST_PAGINATION_PARAMS.pageSize
  const orderBy = params?.orderBy
  const category = params?.category
  return queryOptions({
    queryKey: ['posts', 'pagination', page, pageSize, category, orderBy],
    queryFn: () => apiClient.posts.get({ page, pageSize, category, orderBy }),
    placeholderData: keepPreviousData,
  })
}

export const DEFAULT_POST_PAGINATION_PARAMS = {
  page: 1,
  pageSize: 9,
  direction: 'desc',
}
