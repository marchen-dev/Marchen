'use client'

import { m } from 'framer-motion'

export const HomeDropDown = () => {
  return (
    <div className=" mt-10 flex w-full flex-col items-center gap-2">
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
