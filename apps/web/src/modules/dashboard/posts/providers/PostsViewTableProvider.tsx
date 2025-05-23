/* eslint-disable @eslint-react/no-unstable-context-value */
'use client'

import { useQuery } from '@tanstack/react-query'
import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

import { postColumnsData } from '../components/view/PostsViewTableColumns'
import { PostsViewTableContext } from '../hooks/use-posts-view-table'
import { postsTableQuery } from '../queries/posts-table-query'

export const PostsViewTableProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = useQuery(postsTableQuery())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: data ?? [],
    columns: postColumnsData,
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
