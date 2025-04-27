'use client'

import { AnimatePresence, m } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { FC, PropsWithChildren } from 'react'

export const TransitionAnimationLayout: FC<PropsWithChildren> = ({
  children,
}) => {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="size-full"
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
