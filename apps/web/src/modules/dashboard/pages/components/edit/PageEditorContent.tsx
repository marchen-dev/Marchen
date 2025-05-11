'use client'

import type { PageCreateRequestType } from '@marchen/api-client/interfaces/page.interface'
import { MarkdownEditor } from '@marchen/components/ui'
import { debounce } from 'lodash-es'
import { useFormContext } from 'react-hook-form'

export const PageEditorContent = () => {
  const { setValue, getValues } = useFormContext<PageCreateRequestType>()

  return (
    <MarkdownEditor
      value={getValues('content')}
      onChange={debounce((value) => {
        setValue('content', value)
      }, 200)}
    />
  )
}
