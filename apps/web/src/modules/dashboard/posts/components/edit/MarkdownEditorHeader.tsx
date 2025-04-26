'use client'

import { apiClient } from '@marchen/api-client'
import type { PostCreateRequestType } from '@marchen/api-client/interfaces/post.interface'
import { AIIcon, Input } from '@marchen/components/ui'
import { promptTools } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'

export const MarkdownEditorHeader = () => {
  const { register, getValues, setValue } =
    useFormContext<PostCreateRequestType>()

  const { mutate: generateTitle, isPending: isGeneratingTitle } = useMutation({
    mutationFn: () =>
      apiClient.ai.post({
        prompt: promptTools({
          type: 'title',
          args: [getValues('content')],
        }),
        type: 'title',
      }),
    onSuccess: (data) => {
      if (typeof data.content === 'string') {
        setValue('title', data.content)
      }
    },
  })

  return (
    <div className="mb-3 flex items-center justify-between">
      <Input
        type="text"
        placeholder="标题"
        disabled={isGeneratingTitle}
        {...register('title')}
        icon={<AIIcon disabled={isGeneratingTitle} onClick={generateTitle} />}
      />
    </div>
  )
}
