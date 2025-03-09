'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@base/components/ui/Breadcrumb'
import { Separator } from '@base/components/ui/Separator'
import { SidebarTrigger } from '@base/components/ui/Sidebar'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo } from 'react'

import type { SidebarContentType } from './config'
import { sidebarData } from './config'

export const AppSidebarBreadcrumb = () => {
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
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbList.map((item, index) => (
              <Fragment key={item}>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink>{item}</BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbList.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
