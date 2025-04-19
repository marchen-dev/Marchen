'use client'

import { cn } from '@marchen/lib'
import type { Variants } from 'framer-motion'
import { motion } from 'framer-motion'

const dotVariants: Variants = {
  jump: {
    y: -30,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    },
  },
}

const LoadingThreeDotsJumping: Component = ({ className }) => {
  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className={cn('flex items-center justify-center gap-2.5', className)}
    >
      <motion.div
        className="size-3 rounded-full bg-cn-primary will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="size-3 rounded-full bg-cn-primary will-change-transform"
        variants={dotVariants}
      />
      <motion.div
        className="size-3 rounded-full bg-cn-primary will-change-transform"
        variants={dotVariants}
      />
    </motion.div>
  )
}

const LoadingCircleSpinner: Component = ({ className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg p-10',
        className,
      )}
    >
      <motion.div
        className="size-[50px] rounded-full border-4 border-t-black will-change-transform dark:border-t-white"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

const FullPageLoading = () => {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <LoadingCircleSpinner />
    </div>
  )
}

export { FullPageLoading, LoadingCircleSpinner, LoadingThreeDotsJumping }
