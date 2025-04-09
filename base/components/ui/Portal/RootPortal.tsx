import { isServerSide } from '@base/lib/env'
import type { FC, PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

export const RootPortal: FC<PropsWithChildren> = ({ children }) => {
  if (isServerSide) return null
  return createPortal(children, document.body)
}
