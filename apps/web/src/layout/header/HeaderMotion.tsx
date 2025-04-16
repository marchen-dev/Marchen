'use client'

import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

export const HeaderMotion: FC<PropsWithChildren> = (props) => {
  return (
    <m.header
      className="border-base-300  bg-base-100 dark:bg-base-300 fixed z-10 h-[3.25rem] w-full overflow-hidden border-b px-8 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
    >
      {props.children}
    </m.header>
  )
}
