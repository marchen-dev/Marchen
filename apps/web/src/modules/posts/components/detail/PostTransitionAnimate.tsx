'use client'

import { createFadeInOutTransition } from '@marchen/components/ui'
import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

export const PostTransitionAnimate: FC<PropsWithChildren> = ({ children }) => {
  return <m.div {...createFadeInOutTransition()}>{children}</m.div>
}
