'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FC } from 'react'

import type { SidebarContentType, SidebarItemType } from './config'

export const AppSidebarContent: FC<{
  sidebarContentData: SidebarContentType[]
}> = (props) => {
  const { sidebarContentData } = props
  return (
    <SidebarContent>
      {sidebarContentData.map((item) => (
        <SidebarGroup key={item.title}>
          <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
          <SidebarMenu>
            {item.items.map((subItem) => (
              <SidebarContentMenu
                key={subItem.title}
                sidebarMenuData={subItem}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </SidebarContent>
  )
}

export const SidebarContentMenu: FC<{
  sidebarMenuData: SidebarItemType
}> = (props) => {
  const pathname = usePathname()
  const { title, items, icon, url } = props.sidebarMenuData
  if (!items) {
    return (
      <SidebarMenuItem key={title}>
        <SidebarMenuButton asChild isActive={pathname === url}>
          <Link href={url!}>
            {icon && <i className={cn(icon, 'size-[16px]')} />}
            <span>{title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }
  return (
    <Collapsible
      key={title}
      asChild
      defaultOpen={pathname.includes(url!)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title}>
            {icon && <i className={cn(icon, 'size-[16px]')} />}
            <span>{title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === subItem.url}
                >
                  <Link href={subItem.url!}>
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
