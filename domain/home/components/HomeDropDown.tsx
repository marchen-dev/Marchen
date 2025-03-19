'use client'

import { m } from 'framer-motion'

export const HomeDropDown = () => {
  return (
    <m.i
      className="icon-[mingcute--down-line] text-2xl"
      animate={{ y: 10 }}
      transition={{
        repeat: Infinity,
        duration: 0.6,
        repeatType: 'reverse',
      }}
    />
  )
}
