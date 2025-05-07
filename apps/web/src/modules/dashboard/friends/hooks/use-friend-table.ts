import type { Error as ApiError } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type {
  FriendResponseType,
  FriendStatus,
  FriendUpdateRequestType,
} from '@marchen/api-client/interfaces/friend.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { createContext, use, useCallback } from 'react'
import { toast } from 'sonner'

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

const editFriendAtom = atomWithReset<{
  isOpen: boolean
  friend: FriendResponseType | undefined
}>({
  isOpen: false,
  friend: undefined,
})

export const useEditFriendDialog = () => {
  const [value, setValue] = useAtom(editFriendAtom)

  const onChange = useCallback(
    (open: boolean, friend?: FriendResponseType) => {
      setValue({
        isOpen: open,
        friend,
      })
    },
    [setValue],
  )

  return { value, onChange }
}

export const useFriendTableMutation = () => {
  const queryClient = getQueryClient()
  const deleteFriend = useMutation({
    mutationFn: (id: string) => apiClient.friends.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_FRIENDS],
      })
    },
    onError: (error: ApiError) => {
      toast.error(error.data.message)
    },
  })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FriendStatus }) =>
      apiClient.friends.postStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_FRIENDS],
      })
    },
    onError: (error: ApiError) => {
      toast.error(error.data.message)
    },
  })

  const updateFriend = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id?: string
      data: FriendUpdateRequestType
    }) => {
      if (id) {
        return apiClient.friends.put(id, data)
      }
      return apiClient.friends.postByMaster(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_FRIENDS],
      })
    },
    onError: (error: ApiError) => {
      toast.error(error.data.message)
    },
  })

  return { deleteFriend, updateStatus, updateFriend }
}
