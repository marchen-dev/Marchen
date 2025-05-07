import { apiClient } from '@marchen/api-client'
import type {
  FriendResponseType,
  FriendStatus,
} from '@marchen/api-client/interfaces/friend.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, use } from 'react'

export const FriendTableContext = createContext<{
  table: Table<FriendResponseType>
  type: FriendStatus
} | null>(null)

export const useFriendTable = () => {
  const context = use(FriendTableContext)
  if (!context) {
    throw new Error('useFriendTable must be used within a FriendTableProvider')
  }
  return context
}

export const useFriendTableMutation = () => {
  const queryClient = getQueryClient()
  const { mutate: deleteFriend } = useMutation({
    mutationFn: (id: string) => apiClient.friends.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_FRIENDS],
      })
    },
  })
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FriendStatus }) =>
      apiClient.friends.postStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_FRIENDS],
      })
    },
  })

  return { deleteFriend, updateStatus }
}
