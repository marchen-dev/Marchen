'use client'

import {
  FormField,
  InputWithLabel,
  Label,
  TextAreaWithLabel,
} from '@marchen/components/ui'
import { socialMediaIcon } from '@marchen/lib'
import { memo, useDeferredValue } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import type { profileSchema } from '../../lib/settings-schema'
import { InputWithList } from './SettingsInputWithList'

export const SettingsProfileEditArea = memo(() => {
  const form = useFormContext<z.infer<typeof profileSchema>>()
  const { register, formState } = form
  return (
    <div className="flex w-full max-w-md shrink-0 flex-col gap-6">
      <InputWithLabel
        label="邮箱"
        {...register('email')}
        error={formState.errors.email?.message}
      />
      <InputWithLabel
        label="名称"
        {...register('name')}
        error={formState.errors.name?.message}
      />
      <InputWithLabel
        label="昵称"
        {...register('nickname')}
        error={formState.errors.nickname?.message}
      />
      <InputWithLabel
        label="头像"
        {...register('avatar')}
        error={formState.errors.avatar?.message}
      />
      <TextAreaWithLabel
        label="自我介绍"
        {...register('introduce')}
        error={formState.errors.introduce?.message}
      />
      <div className="flex flex-col gap-2">
        <Label>社交媒体</Label>
        <FormField
          control={form.control}
          name="social"
          render={({ field }) => <SocialMediaList field={field} />}
        />
      </div>
    </div>
  )
})

// FIXME: 需要优化
const SocialMediaList = memo(
  ({
    field,
  }: {
    field: ControllerRenderProps<z.infer<typeof profileSchema>, 'social'>
  }) => {
    const deferredField = useDeferredValue(field)
    return (
      <InputWithList
        values={deferredField.value}
        onChange={deferredField.onChange}
        list={Object.keys(socialMediaIcon)}
      />
    )
  },
)
