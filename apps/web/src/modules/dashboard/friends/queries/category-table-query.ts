import { apiClient } from '@marchen/api-client'
import type { FriendStatus } from '@marchen/api-client/interfaces/friend.interface'
import { Routes } from '@marchen/lib'
import { queryOptions } from '@tanstack/react-query'

export const friendTableQuery = (status: FriendStatus) => {
  return queryOptions({
    queryKey: [Routes.DASHBOARD_FRIENDS, status],
    queryFn: async () => {
      const response = await apiClient.friends.getAll({ status })
      return response.data
    },
  })
}
