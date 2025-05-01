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

import { categoryColumnsData } from '../components/category/CategoryViewTableColumns'
import { CategoryTableContext } from '../hooks/use-category'
import { categoryTableQuery } from '../queries/category-table-query'

interface CategoryTableProviderProps {
  children: React.ReactNode
}

export const CategoryTableProvider: React.FC<CategoryTableProviderProps> = ({
  children,
}) => {
  const { data } = useQuery(categoryTableQuery())
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data: data ?? [],
    columns: categoryColumnsData,
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
    <CategoryTableContext value={{ table }}>{children}</CategoryTableContext>
  )
}
