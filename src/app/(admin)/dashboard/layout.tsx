import { SidebarProvider, SidebarTrigger } from '@base/components/ui/Sidebar'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'

import { AuthLayout } from '~/layout/dashboard/AuthLayout'
import { AppSidebar } from '~/layout/dashboard/sidebar/AppSidebar'

export default async function DashboardLayout(props: PropsWithChildren) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <AuthLayout>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <main>
          <SidebarTrigger />
          {props.children}
        </main>
      </SidebarProvider>
    </AuthLayout>
  )
}
