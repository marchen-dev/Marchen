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

import { pageColumnsData } from '../components/view/PagesTableColumns'
import { PagesTableContext } from '../hooks/use-pages-view-table'
import { pagesTableQuery } from '../queries/pages-table-query'

export const PagesTableProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = useQuery(pagesTableQuery())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: data ?? [],
    columns: pageColumnsData,
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
  return <PagesTableContext value={{ table }}>{children}</PagesTableContext>
}
