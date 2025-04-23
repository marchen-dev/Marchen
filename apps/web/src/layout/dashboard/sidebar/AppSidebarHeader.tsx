import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@marchen/components/ui'

import { ThemeToggle } from '~/layout/header/HeaderTools'

export const AppSidebarHeader = () => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center justify-between p-2 text-sm ">
            <span className="font-medium">Marchen 管理面板</span>
            <ThemeToggle />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
