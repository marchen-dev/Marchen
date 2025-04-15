'use client'

import { routerBuilder, Routes } from '@base/lib/route-builder'
import { m } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export const HeaderMaster = () => {
  const userAvatar = useAggregationDataSelector((state) => state?.user.avatar)
  return (
    <m.section className="flex items-center justify-end  gap-3 md:justify-start xl:ml-6 ">
      <Link href={routerBuilder(Routes.HOME)}>
        <Image
          src={userAvatar ?? ''}
          alt="avatar"
          className="rounded-full"
          height={35}
          width={35}
        />
      </Link>
    </m.section>
  )
}
