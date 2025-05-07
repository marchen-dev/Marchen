import { apiClient } from '@marchen/api-client'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const aiTableQuery = () => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD_AI],
    queryFn: async () => {
      const response = await apiClient.ai.getAll()
      return response.data
    },
  })
}
