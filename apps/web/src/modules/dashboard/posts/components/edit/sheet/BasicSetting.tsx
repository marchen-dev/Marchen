import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import type { PostCreateRequestType } from '@marchen/api-client/interfaces/post.interface'
import { DynamicTags, FormField, InputWithIcon } from '@marchen/components/ui'
import { promptTools } from '@marchen/lib'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { SheetSettings } from './SheetSettings'

export const BasicSetting = () => {
  const { control, register, getValues, setValue } =
    useFormContext<PostCreateRequestType>()

  const { data: categoryList } = useQuery({
    queryKey: ['apiClient.category.get'],
    queryFn: () => apiClient.category.get(),
  })

  const { mutate: generateCategory, isPending: isGeneratingCategory } =
    useMutation({
      mutationFn: () =>
        apiClient.ai.postGenerate({
          prompt: promptTools({
            type: 'category',
            args: [
              getValues('title') || getValues('content'),
              JSON.stringify(categoryList?.data),
            ],
          }),
          type: 'category',
        }),
      onSuccess: (data) => {
        if (typeof data.content === 'string') {
          setValue('categoryId', data.content)
        }
      },
      onError: (error: Error) => {
        toast.error(error.data.message)
      },
    })

  const { mutate: generateTags, isPending: isGeneratingTags } = useMutation({
    mutationFn: () =>
      apiClient.ai.postGenerate({
        prompt: promptTools({
          type: 'tags',
          args: [getValues('content')],
        }),
        type: 'tags',
      }),
    onSuccess: (data) => {
      if (Array.isArray(data.content)) {
        setValue('tags', data.content)
      }
    },
    onError: (error: Error) => {
      toast.error(error.data.message)
    },
  })

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
        title="分类"
        onRefresh={() => {
          generateCategory()
        }}
        disabled={isGeneratingCategory}
      >
        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SheetSettings.Select
              value={field.value}
              placeholder="请选择分类"
              groups={
                categoryList?.data?.map((category) => ({
                  label: category.name,
                  value: category.id,
                })) ?? []
              }
              onValueChange={field.onChange}
              disabled={isGeneratingCategory}
            />
          )}
        />
      </SheetSettings.Item>

      <SheetSettings.Item
        title="标签"
        onRefresh={() => {
          generateTags()
        }}
        disabled={isGeneratingTags}
      >
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <DynamicTags
              value={field.value}
              onChange={field.onChange}
              disabled={isGeneratingTags}
              title="标签"
            />
          )}
        />
      </SheetSettings.Item>

      <SheetSettings.Item
        title="文章路径"
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

      <SheetSettings.Item title="封面">
        <InputWithIcon
          {...register('cover')}
          placeholder="请输入封面图片链接"
          classNames={{ wrapper: 'w-[160px]' }}
        />
      </SheetSettings.Item>
    </SheetSettings.Root>
  )
}
