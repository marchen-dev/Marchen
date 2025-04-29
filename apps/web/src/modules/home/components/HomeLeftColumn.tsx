'use client'

import { parseSocialIcon } from '@marchen/lib'
import { useMemo } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { MasterInfo } from './shared/MasterInfo'

export const HomeLeftColumn = () => {
  const user = useAggregationDataSelector((state) => state?.user)
  const siteTitle = useAggregationDataSelector((state) => state?.site.title)
  const socialMedias = useMemo(
    () => parseSocialIcon(user?.social ?? {}),
    [user?.social],
  )
  return (
    <div className="flex flex-col items-center gap-5 lg:items-start">
      <MasterInfo
        avatar={user?.avatar ?? ''}
        name={user?.name ?? ''}
        introduce={user?.introduce ?? ''}
        socials={socialMedias}
        siteTitle={siteTitle ?? ''}
      />
    </div>
  )
}
