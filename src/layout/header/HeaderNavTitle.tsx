'use client'

import { Routes } from '@base/lib/route-builder'
import Link from 'next/link'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export const HeaderNavTitle = () => {
  const siteTitle = useAggregationDataSelector((state) => state?.site.title)
  return (
    <div className="-order-1 flex items-center justify-center md:hidden">
      <Link href={Routes.HOME} className="font-bold">
        {siteTitle}
      </Link>
    </div>
  )
}
