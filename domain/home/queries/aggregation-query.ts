import { getServerQueryClient } from '@base/lib/query-client.server'
import { apiClient } from '@base/services'
import { cache } from 'react'

export const fetchAggregation = cache(async () => {
  const queryClient = getServerQueryClient()
  return queryClient.fetchQuery({
    queryKey: ['aggregate'],
    queryFn: () => apiClient.aggregate.get(),
  })
})
