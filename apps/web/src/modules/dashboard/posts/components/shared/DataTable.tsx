'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import type {
  ColumnDef,
  Row,
  Table as ReactTableType,
} from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'
import type { FC } from 'react'

interface DataTableProps {
  table: ReactTableType<any>
  columnsData: Array<ColumnDef<any>>
  highlightRow?: Row<any>
}

export const DataTable: FC<DataTableProps> = ({
  table,
  columnsData,
  highlightRow,
}) => {
  return (
    <div className="rounded-md border ">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  highlightRow?.id === row.id && 'bg-zinc-100 dark:bg-zinc-900',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="truncate">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columnsData.length}
                className="h-24 text-center"
              >
                没有数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
