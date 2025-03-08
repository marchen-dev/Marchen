import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@base/components/ui/Collapsible'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@base/components/ui/Sidebar'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
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
  const { title, items, isActive, icon: Icon, url } = props.sidebarMenuData
  if (!items) {
    return (
      <SidebarMenuItem key={title}>
        <SidebarMenuButton asChild>
          <Link href={url!}>
            {Icon && <Icon />}
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
      defaultOpen={isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title}>
            {Icon && <Icon />}
            <span>{title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild>
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
