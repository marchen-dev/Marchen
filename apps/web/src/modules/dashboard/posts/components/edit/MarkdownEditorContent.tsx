'use client'

import { MarkdownEditor } from '@marchen/components/ui'
import { debounce } from 'lodash-es'
import { useFormContext } from 'react-hook-form'

import type { EditorFormData } from '../../providers/PostEditorFormProvider'

export const MarkdownEditorContent = () => {
  const { setValue, getValues } = useFormContext<EditorFormData>()
  return (
    <MarkdownEditor
      value={getValues('content')}
      onChange={debounce((value) => {
        setValue('content', value)
      }, 200)}
    />
  )
}
