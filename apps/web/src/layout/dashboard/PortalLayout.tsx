'use client'

import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

import { ThemeToggle } from '../header/HeaderTools'

export const PortalLayout: FC<PropsWithChildren<{ title: string }>> = (
  props,
) => {
  const { children, title } = props
  return (
    <div className="flex h-full flex-col items-center justify-center pb-24">
      <m.div
        className="w-full px-5 sm:w-[450px]"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="relative text-center text-3xl font-semibold">
          {title}
          <ThemeToggle className="absolute bottom-1 ml-1 inline" />
        </h2>
        {children}
      </m.div>
    </div>
  )
}
