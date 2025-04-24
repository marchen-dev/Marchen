'use client'

import type { PostCreateRequestType } from '@marchen/api-client/interfaces/post.interface'
import { MarkdownEditor } from '@marchen/components/ui'
import { debounce } from 'lodash-es'
import { useFormContext } from 'react-hook-form'

export const MarkdownEditorContent = () => {
  const { setValue, getValues } = useFormContext<PostCreateRequestType>()
  return (
    <MarkdownEditor
      value={getValues('content')}
      onChange={debounce((value) => {
        setValue('content', value)
      }, 200)}
    />
  )
}
