import { apiClient } from '@marchen/api-client'
import { getServerQueryClient } from '@marchen/lib'
import { cache } from 'react'

export const fetchAggregation = cache(async () => {
  const queryClient = getServerQueryClient()
  return queryClient.fetchQuery({
    queryKey: ['aggregate'],
    queryFn: () => apiClient.aggregate.get(),
  })
})
