'use client'

import { Sidebar } from '@marchen/components/ui'

import { AppSidebarContent } from './AppSidebarContent'
import { AppSidebarFooter } from './AppSidebarFooter'
import { AppSidebarHeader } from './AppSidebarHeader'
import { sidebarData } from './config'

export function AppSidebar() {
  return (
    <Sidebar>
      <AppSidebarHeader />
      <AppSidebarContent sidebarContentData={sidebarData.content} />
      <AppSidebarFooter />
    </Sidebar>
  )
}
