import { apiClient } from '@marchen/api-client'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const categoryTableQuery = () => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD_POSTS_CATEGORIES],
    queryFn: async () => {
      const response = await apiClient.category.get()
      return response.data
    },
  })
}
