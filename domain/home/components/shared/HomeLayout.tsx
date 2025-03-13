import { cn } from '@base/lib/helper'
import { HomeFadeInVariants } from '@domain/home/lib/home-motion'
import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'

interface HomeLayoutProps extends PropsWithChildren {
  title: string
  icon: string
}

export const HomeLayout: FC<HomeLayoutProps> = (props) => {
  const { children, title, icon } = props
  return (
    <m.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={HomeFadeInVariants}
      className="pb-8"
    >
      <m.h2
        className="flex items-center gap-2 bg-gradient-to-r from-blue-400  bg-clip-text pb-1 text-2xl font-bold text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <i className={cn(' text-3xl text-blue-400', icon)} />
        {title}
      </m.h2>
      <m.div
        className="mb-6 mt-1 h-1 w-20 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 80, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
      {children}
    </m.section>
  )
}
