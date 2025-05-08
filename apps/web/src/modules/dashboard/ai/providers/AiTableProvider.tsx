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

import { aiColumnsData } from '../components/AiTableColumns'
import { AiTableContext } from '../hooks/use-ai-table'
import { aiTableQuery } from '../queries/ai-table-query'

interface AiTableProviderProps {
  children: React.ReactNode
}

export const AiTableProvider: React.FC<AiTableProviderProps> = ({
  children,
}) => {
  const { data } = useQuery(aiTableQuery())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: data ?? [],
    columns: aiColumnsData,
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
  return <AiTableContext value={{ table }}>{children}</AiTableContext>
}
