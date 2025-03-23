'use client'
import { jotaiStore } from '@base/atom'
import { Provider } from 'jotai'
import type { FC, PropsWithChildren } from 'react'

export const JotaiProvider: FC<PropsWithChildren> = ({ children }) => {
  return <Provider store={jotaiStore}>{children}</Provider>
}
