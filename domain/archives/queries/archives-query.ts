import { apiClient } from '@base/services'
import { queryOptions } from '@tanstack/react-query'

export const archivesQuery = () => {
  return queryOptions({
    queryKey: ['archives'],
    queryFn: () => apiClient.posts.archives(),
  })
}
