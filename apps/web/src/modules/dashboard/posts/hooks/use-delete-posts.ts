'use client'

import { apiClient } from '@marchen/api-client'
import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeletePosts = () => {
  const queryClient = getQueryClient()
  const { mutate: deletePosts } = useMutation({
    mutationFn: (ids: string | string[]) => apiClient.posts.delete(ids),
    onMutate: async (deletedIds) => {
      await queryClient.cancelQueries({
        queryKey: [Routes.DASHBOARD_POSTS_VIEW],
      })
      const previousPosts = queryClient.getQueryData<PostResponseType[]>([
        Routes.DASHBOARD_POSTS_VIEW,
      ])
      queryClient.setQueryData<PostResponseType[]>(
        [Routes.DASHBOARD_POSTS_VIEW],
        (old) => {
          return old?.filter((post) => !deletedIds.includes(post.id))
        },
      )
      return { previousPosts }
    },
    onSuccess: () => {
      toast.success('删除成功')
    },
    onError: (error, deletedId, context) => {
      queryClient.setQueryData<PostResponseType[]>(
        [Routes.DASHBOARD_POSTS_VIEW],
        context?.previousPosts,
      )
      toast.error('删除失败')
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_POSTS_VIEW],
      })
    },
  })

  return { deletePosts }
}
