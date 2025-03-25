import { apiClient } from '@base/services'
import { queryOptions } from '@tanstack/react-query'

export const categoriesQuery = () => {
  return queryOptions({
    queryKey: ['categories'],
    queryFn: () => apiClient,
  })
}
