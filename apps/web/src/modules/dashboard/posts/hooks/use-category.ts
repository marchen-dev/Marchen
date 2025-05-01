import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { CategoryResponseType } from '@marchen/api-client/interfaces/category.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { createContext, use, useCallback } from 'react'
import { toast } from 'sonner'

export const CategoryTableContext = createContext<{
  table: Table<CategoryResponseType>
} | null>(null)

export const useCategoryViewTable = () => {
  const context = use(CategoryTableContext)
  if (!context) {
    throw new Error(
      'useCategoryTable must be used within a CategoryTableProvider',
    )
  }
  return context
}

const editCategoryAtom = atomWithReset<{
  isOpen: boolean
  category: CategoryResponseType | undefined
}>({
  isOpen: false,
  category: undefined,
})

export const useEditCategoryDialog = () => {
  const [value, setValue] = useAtom(editCategoryAtom)

  const onChange = useCallback(
    (open: boolean, category?: CategoryResponseType) => {
      setValue({
        isOpen: open,
        category,
      })
    },
    [setValue],
  )

  return { value, onChange }
}

export const useCategoryMutation = () => {
  const queryClient = getQueryClient()
  const { mutate: deleteCategory } = useMutation({
    mutationFn: (slug: string) => apiClient.category.deleteBySlug(slug),
    onMutate: async (deletedSlug) => {
      await queryClient.cancelQueries({
        queryKey: [Routes.DASHBOARD_POSTS_CATEGORIES],
      })
      const previousCategory = queryClient.getQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
      )
      queryClient.setQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
        (old) => {
          return old?.filter((category) => category.slug !== deletedSlug)
        },
      )
      return { previousCategory }
    },
    onSuccess: () => {
      toast.success('删除成功')
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
        context?.previousCategory,
      )
      toast.error(error.data.message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [Routes.DASHBOARD_POSTS_CATEGORIES],
      })
    },
  })
  const { mutate: createCategory } = useMutation({
    mutationFn: (category: CategoryResponseType) =>
      apiClient.category.post(category),
  })
  const categoryMutation = useMutation<
    object,
    Error,
    { data: CategoryResponseType; id?: string },
    { previousCategory: CategoryResponseType[] | undefined }
  >({
    mutationFn: ({ data, id }) => {
      if (id) {
        return apiClient.category.update(id, data)
      }
      return apiClient.category.post(data)
    },
    onMutate: async ({ data, id }) => {
      await queryClient.cancelQueries({
        queryKey: [Routes.DASHBOARD_POSTS_CATEGORIES],
      })
      const previousCategory = queryClient.getQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
      )
      queryClient.setQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
        (old) => {
          if (id) {
            return old?.map((category) =>
              category.id === id ? { ...category, ...data } : category,
            )
          }
          return [...(old ?? []), { ...data, _count: { posts: 0 } }]
        },
      )
      return { previousCategory }
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? '分类更新成功' : '分类创建成功')
    },
    onError: (error: Error, _variables, context) => {
      queryClient.setQueryData<CategoryResponseType[]>(
        [Routes.DASHBOARD_POSTS_CATEGORIES],
        context?.previousCategory,
      )
      toast.error(error.data.message)
    },
  })

  return { deleteCategory, createCategory, categoryMutation }
}
