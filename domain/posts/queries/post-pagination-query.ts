import { apiClient } from '@base/services'
import type { PaginationRequestType } from '@base/services/interfaces/pagination.interface'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

export const postPaginationQuery = (params?: PaginationRequestType) => {
  const queryParams = params ?? DEFAULT_POST_PAGINATION_PARAMS
  return queryOptions({
    queryKey: ['posts', 'pagination', queryParams],
    queryFn: () => apiClient.posts.get(queryParams),
    placeholderData: keepPreviousData,
  })
}

export const DEFAULT_POST_PAGINATION_PARAMS = {
  page: 1,
  pageSize: 9,
}
