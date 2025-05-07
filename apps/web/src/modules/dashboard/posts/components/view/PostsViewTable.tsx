'use client'

import { usePostsViewTable } from '../../hooks/use-posts-view-table'
import { DataTable } from '../shared/DataTable'
import { postColumnsData } from './PostsViewTableColumns'

export const PostsViewTableContent = () => {
  const { table } = usePostsViewTable()
  return <DataTable table={table} columnsData={postColumnsData} />
}
