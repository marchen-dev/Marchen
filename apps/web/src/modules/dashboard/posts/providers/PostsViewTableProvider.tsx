/* eslint-disable @eslint-react/no-unstable-context-value */
'use client'

import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { useQuery } from '@tanstack/react-query'
import type {
  ColumnFiltersState,
  SortingState,
  Table,
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { createContext, use, useState } from 'react'

import { columnsData } from '../components/table/PostsViewTableColumns'
import { postsTableQuery } from '../queries/posts-table-query'

const PostsViewTableContext = createContext<{
  table: Table<PostResponseType>
} | null>(null)

export const PostsViewTableProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = useQuery(postsTableQuery())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: data!,
    columns: columnsData,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
    state: {
      sorting,
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
