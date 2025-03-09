'use client'

import { m } from 'framer-motion'

export const HomeDropDown = () => {
  return (
    <div className="relative mt-32">
      <div className="absolute bottom-16 flex w-full flex-col items-center gap-2">
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
    </div>
  )
}
