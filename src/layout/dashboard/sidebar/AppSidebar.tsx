import { Sidebar } from '@base/components/ui/Sidebar'

import { AppSidebarContent } from './AppSidebarContent'
import { AppSidebarFooter } from './AppSidebarFooter'
import { AppSidebarHeader } from './AppSidebarHeader'

export function AppSidebar() {
  return (
    <Sidebar>
      <AppSidebarHeader />
      <AppSidebarContent />
      <AppSidebarFooter />
    </Sidebar>
  )
}
