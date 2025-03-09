'use client'
import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

export const FadeInOutTransitionView: FC<PropsWithChildren> = (props) => {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {props.children}
    </m.div>
  )
}
