import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { DashboardGreeting } from '~/modules/dashboard/dashboard/components/DashboardGreeting'
import { DashboardNavigation } from '~/modules/dashboard/dashboard/components/DashboardNavigation'
import { DashboardStatistics } from '~/modules/dashboard/dashboard/components/DashboardStatistics'
import { DashboardProvider } from '~/modules/dashboard/dashboard/providers/DashboardProvider'
import { dashboardQuery } from '~/modules/dashboard/dashboard/queries/dashboard-query'

export default async function DashboardPage() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(dashboardQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout>
      <HydrationBoundary state={dehydrateState}>
        <DashboardProvider>
          <DashboardGreeting />
          <DashboardNavigation />
          <DashboardStatistics />
        </DashboardProvider>
      </HydrationBoundary>
    </AppSidebarToolbarLayout>
  )
}
