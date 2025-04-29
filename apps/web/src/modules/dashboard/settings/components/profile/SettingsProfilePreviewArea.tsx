'use client'

import { parseSocialIcon } from '@marchen/lib'
import { memo, useDeferredValue, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import type { z } from 'zod'

import { MasterInfo } from '~/modules/home/components/shared/MasterInfo'

import type { profileSchema } from '../../lib/schema'

export const SettingsProfilePreviewArea = memo(() => {
  const { watch } = useFormContext<z.infer<typeof profileSchema>>()
  const social = watch('social')
  const deferredSocial = useDeferredValue(social)
  const socialMedias = useMemo(
    () => parseSocialIcon(deferredSocial ?? {}),
    [deferredSocial],
  )
  return (
    <div className="mt-10 flex flex-col items-center gap-5">
      <MasterInfo
        avatar={watch('avatar')}
        name={watch('name')}
        introduce={watch('introduce') ?? ''}
        siteTitle={watch('nickname') ?? ''}
        socials={socialMedias}
        isPreview
      />
    </div>
  )
})
