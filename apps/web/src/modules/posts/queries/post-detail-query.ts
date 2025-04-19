import { apiClient } from '@marchen/api-client'
import { queryOptions } from '@tanstack/react-query'

export interface PostParams {
  category: string
  slug: string
}

export const postDetailQuery = (params: PostParams) => {
  return queryOptions({
    queryKey: ['posts', params.category, params.slug],
    queryFn: () => apiClient.posts.getDetail(params),
  })
}
