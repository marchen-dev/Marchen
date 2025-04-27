'use client'

import { InputWithLabel, TextAreaWithLabel } from '@marchen/components/ui'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import type { profileSchema } from '~/app/(admin)/dashboard/settings/user/page'

export const SettingsProfileEditArea = () => {
  const form = useFormContext<z.infer<typeof profileSchema>>()
  const { register, formState } = form
  return (
    <div className="flex flex-col gap-6">
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
    </div>
  )
}
