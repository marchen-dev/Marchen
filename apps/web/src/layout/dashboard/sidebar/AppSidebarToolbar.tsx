'use client'

import { Separator, SidebarTrigger } from '@marchen/components/ui'
import { usePathname } from 'next/navigation'
import type { FC } from 'react'
import { useMemo } from 'react'

import type { SidebarContentType } from './config'
import { sidebarData } from './config'

interface AppSidebarToolbarLayoutProps {
  children: React.ReactNode
  toolsArea?: React.ReactNode
}

export const AppSidebarToolbarLayout: FC<AppSidebarToolbarLayoutProps> = ({
  children,
  toolsArea,
}) => {
  const pathname = usePathname()
  const breadcrumbList = useMemo(() => {
    const buildPathnameList = (
      contentItems: SidebarContentType[],
      targetPathname: string,
    ): string[] => {
      for (const item of contentItems) {
        for (const subItem of item.items) {
          if (subItem.url === targetPathname) {
            return [subItem.title]
          }
          if (subItem.items) {
            const result = buildPathnameList(
              [{ title: subItem.title, items: subItem.items }],
              targetPathname,
            )
            if (result.length > 0) {
              return [subItem.title, ...result]
            }
          }
        }
      }
      return []
    }

    return buildPathnameList(sidebarData.content, pathname)
  }, [pathname])
  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h3 className="text-lg font-semibold">{breadcrumbList.at(-1)}</h3>
        </div>
        {toolsArea}
      </header>
      <main className="size-full p-4">{children}</main>
    </>
  )
}
