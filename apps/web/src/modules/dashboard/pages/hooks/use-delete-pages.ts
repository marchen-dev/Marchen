'use client'

import { apiClient } from '@marchen/api-client'
import type { PageResponseType } from '@marchen/api-client/interfaces/page.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeletePages = () => {
  const queryClient = getQueryClient()
  const { mutate: deletePages } = useMutation({
    mutationFn: (ids: string | string[]) => {
      if (Array.isArray(ids)) {
        return Promise.all(ids.map((id) => apiClient.pages.delete(id)))
      }
      return apiClient.pages.delete(ids)
    },
    onMutate: async (deletedIds) => {
      await queryClient.cancelQueries({
        queryKey: [Routes.DASHBOARD_PAGES_VIEW],
      })
      const previousPages = queryClient.getQueryData<PageResponseType[]>([
        Routes.DASHBOARD_PAGES_VIEW,
      ])
      queryClient.setQueryData<PageResponseType[]>(
        [Routes.DASHBOARD_PAGES_VIEW],
        (old) => {
          const ids = Array.isArray(deletedIds) ? deletedIds : [deletedIds]
          return old?.filter((page) => !ids.includes(page.id))
        },
      )
      return { previousPages }
    },
    onSuccess: () => {
      toast.success('删除成功')
    },
    onError: (error, deletedId, context) => {
      queryClient.setQueryData<PageResponseType[]>(
        [Routes.DASHBOARD_PAGES_VIEW],
        context?.previousPages,
      )
      toast.error('删除失败')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_PAGES_VIEW],
      })
    },
  })

  return { deletePages }
}
