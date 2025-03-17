'use client'

import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

export const HeaderMotion: FC<PropsWithChildren> = (props) => {
  return (
    <m.header
      className="fixed  z-10 h-14 w-full overflow-hidden border-b border-base-300 bg-zinc-50 px-8 shadow-sm dark:bg-base-300"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
    >
      {props.children}
    </m.header>
  )
}
