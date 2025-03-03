'use client'

import type { GetAggregateeResponseType } from '@base/services/interfaces/aggregate.interface'
import type { FC, PropsWithChildren} from 'react';
import { createContext } from 'react'

const AggregationDataContext = createContext<GetAggregateeResponseType | null>(
  null,
)

export const AggregationDataProvider: FC<
  PropsWithChildren<{ value: GetAggregateeResponseType }>
> = (props) => {
  const { value, children } = props
  return (
    <AggregationDataContext value={value}>{children}</AggregationDataContext>
  )
}
