'use client'

import { Routes } from '@marchen/lib/route-builder'
import { useAggregationDataSelector } from '@marchen/providers/root/AggregationDataProvider'
import Link from 'next/link'

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
