import { apiClient } from '@marchen/api-client'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const dashboardQuery = () => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD],
    queryFn: () => apiClient.aggregate.getDashboard(),
  })
}
