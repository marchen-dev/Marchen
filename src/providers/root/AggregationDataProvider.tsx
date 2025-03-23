'use client'

import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import type { GetAggregateResponseType } from '@base/services/interfaces/aggregate.interface'
import type { ExtractAtomValue } from 'jotai'
import { atom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import type { FC, PropsWithChildren } from 'react'
import { useCallback } from 'react'

const aggregationDataAtom = atom<GetAggregateResponseType | null>(null)

export const AggregationDataProvider: FC<
  PropsWithChildren<{ value: GetAggregateResponseType }>
> = (props) => {
  const { value, children } = props

  useBeforeMounted(() => {
    if (!value) {
      return
    }
    jotaiStore.set(aggregationDataAtom, value)
  })
  return children
}

export const useAggregationDataSelector = <T,>(
  selector: (value: ExtractAtomValue<typeof aggregationDataAtom>) => T,
): T => {
  return useAtomValue(
    selectAtom(
      aggregationDataAtom,
      useCallback((atomValue) => selector(atomValue), []),
    ),
  )
}
