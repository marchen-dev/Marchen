'use client'

import type { PostCreateRequestType } from '@marchen/api-client/interfaces/post.interface'
import { Input } from '@marchen/components/ui'
import { useFormContext } from 'react-hook-form'

export const MarkdownEditorHeader = () => {
  const { register } = useFormContext<PostCreateRequestType>()
  return (
    <div className="mb-3 flex items-center justify-between">
      <Input type="text" placeholder="标题" {...register('title')} />
    </div>
  )
}
