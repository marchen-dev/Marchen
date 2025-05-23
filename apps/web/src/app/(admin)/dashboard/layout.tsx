import { SidebarInset, SidebarProvider } from '@marchen/components/ui'
import { cookies } from 'next/headers'
import type { PropsWithChildren } from 'react'

import { AuthenticatedLayout } from '~/layout/dashboard/AuthLayout'
import { AppSidebar } from '~/layout/dashboard/sidebar/AppSidebar'
import { TransitionAnimationLayout } from '~/layout/dashboard/TransitionAnimationLayout'

export default async function DashboardLayout(props: PropsWithChildren) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')?.value
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === 'true'
  return (
    <AuthenticatedLayout>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <TransitionAnimationLayout>
            {props.children}
          </TransitionAnimationLayout>
        </SidebarInset>
      </SidebarProvider>
    </AuthenticatedLayout>
  )
}
