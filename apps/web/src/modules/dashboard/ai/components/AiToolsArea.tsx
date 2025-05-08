'use client'

import { Button } from '@marchen/components/ui'
import { Plus } from 'lucide-react'

import { useEditAiDialog } from '../hooks/use-ai-table'

export const AiToolsArea = () => {
  const { onChange } = useEditAiDialog()
  return (
    <div className="flex items-center justify-end gap-2">
      <Button onClick={() => onChange(true)} variant="outline">
        <Plus className="size-4" />
        添加
      </Button>
    </div>
  )
}
