import { cn } from '@base/lib/helper'
import { HomeFadeInVariants } from '@domain/home/lib/home-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { m } from 'framer-motion'
import Link from 'next/link'
import type { FC, PropsWithChildren } from 'react'

interface HomeLayoutProps
  extends PropsWithChildren<HTMLMotionProps<'section'>> {
  title: string
  icon: string
  href: string
}

export const HomeLayout: FC<HomeLayoutProps> = (props) => {
  const { children, className, title, icon, href, ...rest } = props
  return (
    <m.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={HomeFadeInVariants}
      className={cn('mx-auto w-full max-w-normal pb-8', className)}
      {...rest}
    >
      <div className="relative mb-5">
        <m.h2 className="flex items-center gap-2 text-2xl font-semibold">
          <i className={cn(icon)} />
          {title}
        </m.h2>
        <Link
          href={href}
          className="absolute  right-0 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center rounded-xl border border-base-300 bg-primary px-3 py-1  transition-colors duration-300 hover:text-secondary"
        >
          <i className="icon-[mingcute--right-line] text-2xl" />
        </Link>
      </div>
      {children}
    </m.section>
  )
}
