'use client'

import { cn } from '@base/lib/helper'
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

export default LoadingThreeDotsJumping
