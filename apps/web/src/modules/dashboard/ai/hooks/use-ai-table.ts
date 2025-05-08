import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type {
  AiRequestType,
  AiResponseType,
} from '@marchen/api-client/interfaces/ai.interface'
import { getQueryClient, Routes } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { createContext, use, useCallback } from 'react'
import { toast } from 'sonner'

export const AiTableContext = createContext<{
  table: Table<AiResponseType>
} | null>(null)

export const useAiTable = () => {
  const context = use(AiTableContext)
  if (!context) {
    throw new Error('useAiTable must be used within a AiTableProvider')
  }
  return context
}

const editAiAtom = atomWithReset<{
  isOpen: boolean
  ai: AiResponseType | undefined
}>({
  isOpen: false,
  ai: undefined,
})

export const useEditAiDialog = () => {
  const [value, setValue] = useAtom(editAiAtom)

  const onChange = useCallback(
    (open: boolean, ai?: AiResponseType) => {
      setValue({
        isOpen: open,
        ai,
      })
    },
    [setValue],
  )

  return { value, onChange }
}

export const useAiMutation = () => {
  const queryClient = getQueryClient()
  const updateAi = useMutation({
    mutationFn: (ai: AiRequestType) => {
      if (ai.id) {
        return apiClient.ai.put(ai.id, ai)
      }
      return apiClient.ai.post(ai)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [Routes.DASHBOARD_AI] })
      toast.success(variables.id ? '模型修改成功' : '模型添加成功')
    },
    onError: (error: Error) => {
      toast.error(error.data.message)
    },
  })

  const deleteAi = useMutation({
    mutationFn: (id: string) => apiClient.ai.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [Routes.DASHBOARD_AI] })
      toast.success('模型删除成功')
    },
    onError: (error: Error) => {
      toast.error(error.data.message)
    },
  })

  return { updateAi, deleteAi }
}
