'use client'

import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import type { profileSchema } from '~/app/(admin)/dashboard/settings/user/page'

export const SettingsProfilePreviewArea = memo(() => {
  const { watch } = useFormContext<z.infer<typeof profileSchema>>()
  return (
    <div className="flex flex-col gap-6">
      <p>{watch('name')}</p>
    </div>
  )
})
