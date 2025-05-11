'use client'

import { Button, Input } from '@marchen/components/ui'
import { Routes } from '@marchen/lib'
import { Plus, Trash } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'

import { useDeletePages } from '../../hooks/use-delete-pages'
import { usePagesViewTable } from '../../hooks/use-pages-view-table'

export const PagesTableHeader = () => {
  const { table } = usePagesViewTable()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { deletePages } = useDeletePages()
  const handleDeletePages = useCallback(() => {
    deletePages(selectedRows.map((row) => row.original.id))
  }, [deletePages, selectedRows])

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center ">
        <Input
          placeholder="搜索标题"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-60"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          onClick={handleDeletePages}
          disabled={selectedRows.length === 0}
        >
          <Trash className="size-4" />
          删除
        </Button>
        <Button variant="outline" asChild>
          <Link href={Routes.DASHBOARD_PAGES_EDIT}>
            <Plus className="size-4" />
            新建
          </Link>
        </Button>
      </div>
    </div>
  )
}
