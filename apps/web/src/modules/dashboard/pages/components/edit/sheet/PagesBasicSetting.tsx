import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { PageCreateRequestType } from '@marchen/api-client/interfaces/page.interface'
import { InputWithIcon } from '@marchen/components/ui'
import { promptTools } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { SheetSettings } from '~/modules/dashboard/posts/components/edit/sheet/SheetSettings'

export const PagesBasicSetting = () => {
  const { register, getValues, setValue } =
    useFormContext<PageCreateRequestType>()

  const { mutate: generateSlug, isPending: isGeneratingSlug } = useMutation({
    mutationFn: () =>
      apiClient.ai.postGenerate({
        prompt: promptTools({
          type: 'slug',
          args: [getValues('title') || getValues('content')],
        }),
        type: 'slug',
      }),
    onSuccess: (data) => {
      if (typeof data.content === 'string') {
        setValue('slug', data.content)
      }
    },
    onError: (error: Error) => {
      toast.error(error.data.message)
    },
  })

  return (
    <SheetSettings.Root>
      <SheetSettings.Item
        title="页面路径"
        onRefresh={() => {
          generateSlug()
        }}
        disabled={isGeneratingSlug}
      >
        <InputWithIcon
          {...register('slug')}
          placeholder="例如: learn-react"
          classNames={{ wrapper: 'w-[160px]' }}
          disabled={isGeneratingSlug}
        />
      </SheetSettings.Item>
      <SheetSettings.Item title="页面图标">
        <InputWithIcon
          {...register('icon')}
          placeholder=""
          classNames={{ wrapper: 'w-[160px]' }}
        />
      </SheetSettings.Item>
    </SheetSettings.Root>
  )
}
