'use client'

import { DynamicTags, FormField, InputWithLabel } from '@marchen/components/ui'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import type { websiteSchema } from '../../lib/settings-schema'
import { WrapperWithLabel } from '../shared/WrapperWithLabel'

export const SettingsWebsiteArea = () => {
  const form = useFormContext<z.infer<typeof websiteSchema>>()
  const { register, formState } = form
  return (
    <div className="flex w-full shrink-0 flex-col gap-6">
      <InputWithLabel
        label="名称"
        {...register('title')}
        error={formState.errors.title?.message}
      />
      <InputWithLabel
        label="描述"
        {...register('description')}
        error={formState.errors.description?.message}
      />
      <InputWithLabel
        label="图标"
        {...register('favicon')}
        error={formState.errors.favicon?.message}
      />
      <InputWithLabel
        label="前端地址"
        {...register('url')}
        error={formState.errors.url?.message}
      />
      <WrapperWithLabel
        label="关键词"
        error={formState.errors.keywords?.message}
      >
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <DynamicTags
              value={field.value}
              onChange={field.onChange}
              title="标签"
              classNames={{ trigger: 'max-w-24 w-full' }}
            />
          )}
        />
      </WrapperWithLabel>
    </div>
  )
}
