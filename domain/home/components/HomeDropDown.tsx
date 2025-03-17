'use client'

import { m } from 'framer-motion'

export const HomeDropDown = () => {
  return (
    <div className="absolute bottom-10 hidden w-full flex-col items-center gap-2 xl:flex">
      <m.i
        className="icon-[mingcute--down-line] text-2xl"
        animate={{ y: 10 }}
        transition={{
          repeat: Infinity,
          duration: 0.6,
          repeatType: 'reverse',
        }}
      />
    </div>
  )
}
