import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import type { Table } from '@tanstack/react-table'
import { createContext, use } from 'react'

export const PostsViewTableContext = createContext<{
  table: Table<PostResponseType>
} | null>(null)

export const usePostsViewTable = () => {
  const context = use(PostsViewTableContext)
  if (!context) {
    throw new Error(
      'usePostsViewTable must be used within a PostsViewTableProvider',
    )
  }
  return context
}
