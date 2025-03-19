'use client'

import type { GetAggregateResponseType } from '@base/services/interfaces/aggregate.interface'
import { useUserStore } from '@base/store/user'
import type { FC, PropsWithChildren } from 'react'
import { createContext, use, useEffect, useMemo } from 'react'

const AggregationDataContext = createContext<GetAggregateResponseType | null>(
  null,
)

export const AggregationDataProvider: FC<
  PropsWithChildren<{ value: GetAggregateResponseType }>
> = (props) => {
  const { value, children } = props
  const { setMaster } = useUserStore()
  const memoizedValue = useMemo(() => value, [value])
  useEffect(() => {
    setMaster({ ...value.user })
  }, [setMaster, value])
  return (
    <AggregationDataContext value={memoizedValue}>
      {children}
    </AggregationDataContext>
  )
}

export const useAggregationData = () => {
  const aggregationData = use(AggregationDataContext)
  if (!aggregationData) {
    throw new Error(
      'useAggregationData has to be used within AggregationDataProvider',
    )
  }
  return aggregationData
}
