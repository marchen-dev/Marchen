'use client'

import { apiClient } from '@marchen/api-client'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { PageForm } from '../types/page'

export const useSavePage = () => {
  const queryClient = getQueryClient()

  const { mutateAsync: savePage } = useMutation({
    mutationFn: async (data: PageForm) => {
      if (!data.id) {
        return apiClient.pages.post({
          title: data.title,
          content: data.content,
          slug: data.slug,
        })
      }
      return apiClient.pages.patch(data.id, {
        title: data.title,
        content: data.content,
        slug: data.slug,
      })
    },
    onSuccess: (_, data) => {
      toast.success(data.id ? '页面更新成功' : '页面创建成功')
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_PAGES_VIEW],
      })
    },
    onError: (_, data) => {
      toast.error(data.id ? '页面更新失败' : '页面创建失败')
    },
  })

  return { savePage }
}
