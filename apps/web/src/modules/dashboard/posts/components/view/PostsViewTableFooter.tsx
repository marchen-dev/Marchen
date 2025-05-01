'use client'

import { usePostsViewTable } from '../../hooks/use-posts-view-table'
import { PostViewTablePagination } from './PostViewTablePagination'

export const PostsViewTableFooter = () => {
  const { table } = usePostsViewTable()
  return (
    <div>
      <PostViewTablePagination table={table} />
    </div>
  )
}
