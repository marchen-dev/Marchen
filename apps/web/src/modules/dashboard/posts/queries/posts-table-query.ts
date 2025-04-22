import { apiClient } from '@marchen/api-client'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const postsTableQuery = () => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD_POSTS_VIEW],
    queryFn: async () => {
      const response = await apiClient.posts.getAll()
      return response.data
    },
  })
}
