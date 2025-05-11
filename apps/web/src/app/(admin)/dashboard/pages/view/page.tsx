import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { PagesTableContent } from '~/modules/dashboard/pages/components/view/PagesTable'
import { PagesTableFooter } from '~/modules/dashboard/pages/components/view/PagesTableFooter'
import { PagesTableHeader } from '~/modules/dashboard/pages/components/view/PagesTableHeader'
import { PagesTableProvider } from '~/modules/dashboard/pages/providers/PagesTableProvider'
import { pagesTableQuery } from '~/modules/dashboard/pages/queries/pages-table-query'

export default async function DashboardPagesViewPage() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(pagesTableQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout>
      <HydrationBoundary state={dehydrateState}>
        <PagesTableProvider>
          <PagesTableHeader />
          <PagesTableContent />
          <PagesTableFooter />
        </PagesTableProvider>
      </HydrationBoundary>
    </AppSidebarToolbarLayout>
  )
}
