import { apiClient } from '@base/services'
import type { PaginationRequestType } from '@base/services/interfaces/pagination.interface'
import { keepPreviousData, queryOptions } from '@tanstack/react-query'

export const postPaginationQuery = (
  params?: Partial<PaginationRequestType>,
) => {
  const page = params?.page ?? DEFAULT_POST_PAGINATION_PARAMS.page
  const pageSize = params?.pageSize ?? DEFAULT_POST_PAGINATION_PARAMS.pageSize
  // const order = params?.order
  // const orderby = params?.orderby
  // const direction = params?.direction
  return queryOptions({
    queryKey: ['posts', 'pagination', page, pageSize],
    queryFn: () => apiClient.posts.get({ page, pageSize }),
    placeholderData: keepPreviousData,
  })
}

export const DEFAULT_POST_PAGINATION_PARAMS = {
  page: 1,
  pageSize: 9,
  direction: 'desc',
}
