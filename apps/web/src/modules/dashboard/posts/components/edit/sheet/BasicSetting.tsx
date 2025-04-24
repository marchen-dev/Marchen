import { apiClient } from '@marchen/api-client'
import type { PostCreateRequestType } from '@marchen/api-client/interfaces/post.interface'
import { DynamicList, FormField, Input } from '@marchen/components/ui'
import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'

import { SheetSettings } from './SheetSettings'

export const BasicSetting = () => {
  const { control, register } = useFormContext<PostCreateRequestType>()

  const { data: categoryList } = useQuery({
    queryKey: ['apiClient.category.get'],
    queryFn: () => apiClient.category.get(),
  })
  return (
    <SheetSettings.Root>
      <SheetSettings.Item title="分类">
        <FormField
          control={control}
          name="categoryId"
          render={({ field }) => (
            <SheetSettings.Select
              defaultValue={field.value}
              placeholder="请选择分类"
              groups={
                categoryList?.data?.map((category) => ({
                  label: category.name,
                  value: category.id,
                })) ?? []
              }
              onValueChange={field.onChange}
            />
          )}
        />
      </SheetSettings.Item>

      <SheetSettings.Item title="标签">
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <DynamicList
              defaultValue={field.value}
              onChange={field.onChange}
              title="标签"
            />
          )}
        />
      </SheetSettings.Item>

      <SheetSettings.Item title="文章路径">
        <Input
          {...register('slug')}
          placeholder="例如: learn-react"
          className="w-[160px]"
        />
      </SheetSettings.Item>

      <SheetSettings.Item title="封面">
        <Input
          {...register('cover')}
          placeholder="请输入封面图片链接"
          className="w-[160px]"
        />
      </SheetSettings.Item>
    </SheetSettings.Root>
  )
}
