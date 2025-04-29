'use client'

import { InputWithLabel } from '@marchen/components/ui'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import type { websiteSchema } from '../../lib/settings-schema'

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
        label="关键词"
        {...register('keywords')}
        error={formState.errors.keywords?.message}
      />
      <InputWithLabel
        label="favicon"
        {...register('favicon')}
        error={formState.errors.favicon?.message}
      />
    </div>
  )
}
