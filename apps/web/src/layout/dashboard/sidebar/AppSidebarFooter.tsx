'use client'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@marchen/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@marchen/components/ui/Dropdown'
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@marchen/components/ui/Sidebar'
import { useIsMobile } from '@marchen/hooks/use-mobile'
import { removeToken } from '@marchen/lib/cookie'
import { routerBuilder, Routes } from '@marchen/lib/route-builder'
import { useMasterData } from '@marchen/providers/dashboard/MasterDataProvider'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const AppSidebarFooter = () => {
  const { name, email, avatar } = useMasterData()
  const isMobile = useIsMobile()
  const router = useRouter()
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{name}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  removeToken()
                  router.replace(routerBuilder(Routes.LOGIN))
                  toast.success('退出登录成功')
                }}
              >
                <LogOut />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
