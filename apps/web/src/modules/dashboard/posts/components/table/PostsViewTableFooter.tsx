'use client'

import { usePostsViewTable } from '../../providers/PostsViewTableProvider'
import { PostViewTablePagination } from './PostViewTablePagination'

export const PostsViewTableFooter = () => {
  const { table } = usePostsViewTable()
  return (
    <div>
      <PostViewTablePagination table={table} />
    </div>
  )
}
