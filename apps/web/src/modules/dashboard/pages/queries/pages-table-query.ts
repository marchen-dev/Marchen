import { apiClient } from '@marchen/api-client'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const pagesTableQuery = () => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD_PAGES_VIEW],
    queryFn: async () => {
      const response = await apiClient.pages.get()
      return response.data
    },
  })
}
