import { SidebarInset, SidebarProvider } from '@base/components/ui/Sidebar'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'

import { AuthenticatedLayout } from '~/layout/dashboard/AuthLayout'
import { AppSidebar } from '~/layout/dashboard/sidebar/AppSidebar'
import { AppSidebarBreadcrumb } from '~/layout/dashboard/sidebar/AppSidebarBreadcrumb'

export default async function DashboardLayout(props: PropsWithChildren) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <AuthenticatedLayout>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <AppSidebarBreadcrumb />
          <main className="p-4">{props.children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedLayout>
  )
}
