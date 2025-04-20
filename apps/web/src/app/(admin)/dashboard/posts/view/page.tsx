import { apiClient } from '@marchen/api-client'

import { PostsViewTable } from '~/modules/dashboard/posts/components/table/PostsViewTable'
import { PostsViewTableFooter } from '~/modules/dashboard/posts/components/table/PostsViewTableFooter'
import { PostsViewTableHeader } from '~/modules/dashboard/posts/components/table/PostsViewTableHeader'
import { PostsViewTableProvider } from '~/modules/dashboard/posts/providers/PostsViewTableProvider'

export default async function Posts() {
  const postsData = await apiClient.posts.all()
  return (
    <PostsViewTableProvider posts={postsData.data}>
      <PostsViewTableHeader />
      <PostsViewTable />
      <PostsViewTableFooter />
    </PostsViewTableProvider>
  )
}
