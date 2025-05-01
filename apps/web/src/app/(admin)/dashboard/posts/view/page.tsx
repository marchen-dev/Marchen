import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { PostsViewTable } from '~/modules/dashboard/posts/components/view/PostsViewTable'
import { PostsViewTableFooter } from '~/modules/dashboard/posts/components/view/PostsViewTableFooter'
import { PostsViewTableHeader } from '~/modules/dashboard/posts/components/view/PostsViewTableHeader'
import { PostsViewTableProvider } from '~/modules/dashboard/posts/providers/PostsViewTableProvider'
import { postsTableQuery } from '~/modules/dashboard/posts/queries/posts-table-query'

export default async function Posts() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(postsTableQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <AppSidebarToolbarLayout>
      <HydrationBoundary state={dehydrateState}>
        <PostsViewTableProvider>
          <PostsViewTableHeader />
          <PostsViewTable />
          <PostsViewTableFooter />
        </PostsViewTableProvider>
      </HydrationBoundary>
    </AppSidebarToolbarLayout>
  )
}
