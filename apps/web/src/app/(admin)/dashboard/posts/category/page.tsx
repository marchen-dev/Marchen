import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { CategoryTableContent } from '~/modules/dashboard/posts/components/category/CategoryTable'
import { CategoryTableHeader } from '~/modules/dashboard/posts/components/category/CategoryTableHeader'
import { EditCategoryDialog } from '~/modules/dashboard/posts/components/category/EditCategoryDialog'
import { CategoryTableProvider } from '~/modules/dashboard/posts/providers/CategoryTableProvider'
import { categoryTableQuery } from '~/modules/dashboard/posts/queries/category-table-query'

export default async function Posts() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(categoryTableQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout>
      <HydrationBoundary state={dehydrateState}>
        <CategoryTableProvider>
          <CategoryTableHeader />
          <CategoryTableContent />
          <EditCategoryDialog />
        </CategoryTableProvider>
      </HydrationBoundary>
    </AppSidebarToolbarLayout>
  )
}
