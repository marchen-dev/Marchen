import { apiClient } from '@marchen/api-client'
import { queryOptions } from '@tanstack/react-query'

export interface PageParams {
  slug: string
}

export const pageDetailQuery = (params: PageParams) => {
  return queryOptions({
    queryKey: ['pages', params.slug],
    queryFn: () => apiClient.pages.getBySlug(params.slug),
  })
}
