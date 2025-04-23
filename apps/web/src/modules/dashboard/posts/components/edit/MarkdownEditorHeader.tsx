'use client'
import { Input } from '@marchen/components/ui'
import { useFormContext } from 'react-hook-form'

import type { EditorFormData } from '../../providers/PostEditorFormProvider'

export const MarkdownEditorHeader = () => {
  const { register } = useFormContext<EditorFormData>()
  return (
    <div className="mb-3 flex items-center justify-between">
      <Input type="text" placeholder="标题" {...register('title')} />
    </div>
  )
}
