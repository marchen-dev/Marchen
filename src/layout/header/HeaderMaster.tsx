'use client'

import { m } from 'framer-motion'
import Image from 'next/image'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HeaderMaster = () => {
  const { site, user } = useAggregationData()
  return (
    <m.section className="flex items-center gap-3 xl:ml-6">
      <Image
        src={user.avatar}
        alt="avatar"
        className="rounded-full"
        height={42}
        width={42}
      />
      <div className="hidden overflow-hidden lg:block">
        <h4 className=" font-medium">{site.title}</h4>
        <p className="truncate text-sm text-secondary dark:text-base-content">
          {site.description}
        </p>
      </div>
    </m.section>
  )
}
