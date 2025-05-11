'use client'
import { cn } from '@marchen/lib'
import { m } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { HeaderNavConfig, HeaderNavMoreConfig } from './config'

export const HeaderDesktopNav = () => {
  const pathname = usePathname()
  const pages = useAggregationDataSelector((state) => state?.page)
  const mergeConfig = useMemo(() => {
    const moreConfigs = [
      ...HeaderNavMoreConfig.items,
      ...(pages?.map((page) => ({
        ...page,
        slug: page.slug,
        icon: page.icon || 'icon-[mingcute--file-line]',
      })) || []),
    ]
    return [...HeaderNavConfig, { ...HeaderNavMoreConfig, items: moreConfigs }]
  }, [pages])
  return (
    <nav className="hidden items-center justify-center md:flex">
      <ul className="flex shrink-0 gap-12">
        {mergeConfig.map((item) =>
          item.slug ? (
            <NormalNav
              key={item.icon}
              icon={item.icon}
              title={item.title}
              slug={item.slug}
              selected={pathname === item.slug}
            />
          ) : (
            <MoreNav key={item.icon} {...item} />
          ),
        )}
      </ul>
    </nav>
  )
}

export interface NormalNavProps {
  icon: string
  title: string
  slug: string
  selected?: boolean
}

const NormalNav = ({ icon, title, slug, selected }: NormalNavProps) => {
  return (
    <m.li key={icon} className="relative" whileHover="hover" initial="initial">
      <Link
        href={slug}
        className={cn(
          'flex items-center gap-1 text-zinc-700 dark:text-zinc-300',
          selected && 'font-semibold text-black dark:text-white',
        )}
      >
        <i className={cn(icon, 'hidden text-lg', 'lg:inline')} />
        <span> {title}</span>
      </Link>
      {/* <div className="absolute -bottom-1 flex w-full   justify-center">
        <m.div
          className={cn(' h-0.5 w-3/5 bg-zinc-500 dark:bg-zinc-300')}
          variants={{
            initial: { scaleX: 0 },
            hover: { scaleX: 1 },
          }}
          transition={{ duration: 0.3 }}
        />
      </div> */}
    </m.li>
  )
}

export interface MoreNavProps {
  icon: string
  title: string
  items?: Array<{
    icon: string
    title: string
    slug: string
  }>
}

const MoreNav = ({ icon, title, items }: MoreNavProps) => {
  return (
    <m.li
      className="relative flex cursor-pointer items-center gap-1"
      whileHover="hover"
      initial="initial"
    >
      <span>{title}</span>
      <i className={cn(icon, 'text-lg')} />
      <m.ul
        className="absolute left-1/2 top-8 z-10 min-w-[125px] -translate-x-1/2  rounded-md border  bg-primary shadow-sm"
        variants={{
          initial: { opacity: 0, display: 'none' },
          hover: { opacity: 1, display: 'block' },
        }}
        transition={{ duration: 0.3 }}
      >
        {items?.map((item) => (
          <li
            key={item.slug}
            className="flex justify-center px-6  py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Link
              href={item.slug}
              className="flex w-full items-center justify-between "
            >
              <i className={cn(item.icon)} />
              <span>{item.title}</span>
            </Link>
          </li>
        ))}
      </m.ul>
    </m.li>
  )
}
