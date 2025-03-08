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

import { sidebarData } from './config'

export const AppSidebarBreadcrumb = () => {
  const pathname = usePathname()

  const breadcrumbList = useMemo(() => {
    const pathnameList: string[] = []
    sidebarData.content.some((item) => {
      return item.items.some((subItem) => {
        if (subItem.url === pathname) {
          pathnameList.push(subItem.title)
          return true
        }
        if (subItem?.items) {
          const _pathname = subItem.title
          return subItem.items.some((nestedItem) => {
            if (nestedItem.url === pathname) {
              pathnameList.push(_pathname, nestedItem.title)
              return true
            }
            return false
          })
        }
        return false
      })
    })
    return pathnameList
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
