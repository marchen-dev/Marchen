import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { aiTableQuery } from '~/modules/dashboard/ai/queries/ai-table-query'

export default async function DashboardSettingsAiPage() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(aiTableQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout>
      <HydrationBoundary state={dehydrateState} />
    </AppSidebarToolbarLayout>
  )
}
