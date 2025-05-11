'use client'

import { apiClient } from '@marchen/api-client'
import type { PageCreateRequestType } from '@marchen/api-client/interfaces/page.interface'
import { AIIcon, InputWithIcon } from '@marchen/components/ui'
import { promptTools } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'

export const PageEditorHeader = () => {
  const { register, getValues, setValue } =
    useFormContext<PageCreateRequestType>()

  const { mutate: generateTitle, isPending: isGeneratingTitle } = useMutation({
    mutationFn: () =>
      apiClient.ai.postGenerate({
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
      <InputWithIcon
        type="text"
        placeholder="标题"
        disabled={isGeneratingTitle}
        {...register('title')}
        icon={<AIIcon disabled={isGeneratingTitle} onClick={generateTitle} />}
      />
    </div>
  )
}
