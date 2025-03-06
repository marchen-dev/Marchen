'use client'

import type { UserMasterResponseType } from '@base/services/interfaces/user.interface'
import type { FC, PropsWithChildren } from 'react'
import { createContext, use, useMemo } from 'react'

const MasterContext = createContext<UserMasterResponseType | null>(null)

export const MasterDataProvider: FC<
  PropsWithChildren<{ value: UserMasterResponseType }>
> = ({ children, value }) => {
  const memoizedValue = useMemo(() => value, [value])
  return <MasterContext value={memoizedValue}>{children}</MasterContext>
}

export const useMasterData = () => {
  const masterData = use(MasterContext)
  if (!masterData) {
    throw new Error('useMasterData has to be used within MasterDataProvider')
  }
  return masterData
}
