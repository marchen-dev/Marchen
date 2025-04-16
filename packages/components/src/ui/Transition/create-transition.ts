'use client'

import { hydrating } from '@marchen/atom'
import type { MotionProps } from 'framer-motion'

interface createTransitionParams extends MotionProps {
  lcpOptimization?: boolean
  [key: string]: any
}

export const createTransition = (params: createTransitionParams) => {
  const { lcpOptimization, ...motion } = params

  if (lcpOptimization && hydrating()) {
    return
  }
  return motion
}

export const createFadeInOutTransition = (props?: {
  lcpOptimization?: boolean
}) => {
  const { lcpOptimization = true } = props ?? {}
  return createTransition({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2 },
    lcpOptimization,
  })
}
