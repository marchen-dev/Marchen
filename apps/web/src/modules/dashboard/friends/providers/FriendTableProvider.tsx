/* eslint-disable @eslint-react/no-unstable-context-value */
'use client'

import type { FriendStatus } from '@marchen/api-client/interfaces/friend.interface'
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

import { friendColumnsData } from '../components/FriendTableColumns'
import { FriendTableContext } from '../hooks/use-friend-table'
import { friendTableQuery } from '../queries/category-table-query'

interface FriendTableProviderProps {
  children: React.ReactNode
  type: FriendStatus
}

export const FriendTableProvider: React.FC<FriendTableProviderProps> = ({
  children,
  type,
}) => {
  const { data } = useQuery(friendTableQuery(type))
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: data ?? [],
    columns: friendColumnsData(type),
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
    <FriendTableContext value={{ table, type }}>{children}</FriendTableContext>
  )
}
