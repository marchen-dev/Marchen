'use client'

import { m } from 'framer-motion'

import { useScrollToPosts } from '../hooks/use-scroll-to-posts'

export const HomeDropDown = () => {
  const { handleScrollToPosts } = useScrollToPosts()
  return (
    <m.i
      className="icon-[mingcute--down-line] cursor-pointer text-2xl"
      animate={{ y: 10 }}
      transition={{
        repeat: Infinity,
        duration: 0.6,
        repeatType: 'reverse',
      }}
      onClick={handleScrollToPosts}
    />
  )
}
