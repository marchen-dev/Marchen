'use client'

import { routerBuilder, Routes } from '@base/lib/route-builder'
import { m } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HeaderMaster = () => {
  const { user } = useAggregationData()
  return (
    <m.section className="flex items-center gap-3 xl:ml-6">
      <Link href={routerBuilder(Routes.HOME)}>
        <Image
          src={user.avatar}
          alt="avatar"
          className="rounded-full"
          height={40}
          width={40}
        />
      </Link>
    </m.section>
  )
}
