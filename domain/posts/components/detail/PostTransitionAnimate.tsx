'use client'

import { createFadeInOutTransition } from '@base/components/ui/Transition/create-transition'
import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

export const PostTransitionAnimate: FC<PropsWithChildren> = ({ children }) => {
  return <m.div {...createFadeInOutTransition()}>{children}</m.div>
}
