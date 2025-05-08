import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { AiTableContent } from '~/modules/dashboard/ai/components/AiTableContent'
import { AiToolsArea } from '~/modules/dashboard/ai/components/AiToolsArea'
import { EditAiDialog } from '~/modules/dashboard/ai/components/EditAiDialog'
import { AiTableProvider } from '~/modules/dashboard/ai/providers/AiTableProvider'
import { aiTableQuery } from '~/modules/dashboard/ai/queries/ai-table-query'

export default async function DashboardSettingsAiPage() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(aiTableQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout toolsArea={<AiToolsArea />}>
      <HydrationBoundary state={dehydrateState}>
        <AiTableProvider>
          <AiTableContent />
          <EditAiDialog />
        </AiTableProvider>
      </HydrationBoundary>
    </AppSidebarToolbarLayout>
  )
}
