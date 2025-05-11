'use client'
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@marchen/components/ui'
import Link from 'next/link'
import { useMemo } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { HeaderNavConfig, HeaderNavMoreConfig } from './config'
import type { NormalNavProps } from './HeaderDesktopNav'

export const HeaderMobileNav = () => {
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
    return moreConfigs
  }, [pages])
  return (
    <nav className="-order-2 flex justify-start md:hidden">
      <Drawer>
        <DrawerTrigger>
          <div className="flex items-center rounded-md border p-1.5">
            <i className="icon-[mingcute--menu-line] size-5 " />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>导航</DrawerTitle>
          </DrawerHeader>
          <DrawerFooter className="space-y-8">
            <NavContentLayout title="主要">
              {HeaderNavConfig.map(
                (item) =>
                  item.slug && (
                    <NavItem
                      key={item.icon}
                      icon={item.icon}
                      title={item.title}
                      slug={item.slug}
                    />
                  ),
              )}
            </NavContentLayout>
            <NavContentLayout title="更多">
              {mergeConfig.map((item) => (
                <NavItem key={item.icon} {...item} />
              ))}
            </NavContentLayout>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </nav>
  )
}

interface NavContentLayoutProps {
  title: string
  children: React.ReactNode
}

const NavContentLayout = ({ title, children }: NavContentLayoutProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="flex gap-4">{children}</ul>
    </div>
  )
}

const NavItem = ({ icon, title, slug }: NormalNavProps) => {
  return (
    <li key={icon}>
      <DrawerClose asChild>
        <Button variant="outline" asChild size="lg">
          <Link href={slug}>
            <i className={icon} />
            <span> {title}</span>
          </Link>
        </Button>
      </DrawerClose>
    </li>
  )
}
