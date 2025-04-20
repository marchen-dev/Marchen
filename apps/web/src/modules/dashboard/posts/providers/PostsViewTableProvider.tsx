/* eslint-disable @eslint-react/no-unstable-context-value */
'use client'

import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import type { ColumnFiltersState, Table } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { createContext, use, useState } from 'react'

import { columnsData } from '../components/table/Columns'

const PostsViewTableContext = createContext<{
  table: Table<PostResponseType>
} | null>(null)

export const PostsViewTableProvider = ({
  children,
  posts,
}: {
  children: React.ReactNode
  posts: PostResponseType[]
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const table = useReactTable({
    data: posts,
    columns: columnsData,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  })

  return (
    <PostsViewTableContext value={{ table }}>{children}</PostsViewTableContext>
  )
}

export const usePostsViewTable = () => {
  const context = use(PostsViewTableContext)
  if (!context) {
    throw new Error(
      'usePostsViewTable must be used within a PostsViewTableProvider',
    )
  }
  return context
}
