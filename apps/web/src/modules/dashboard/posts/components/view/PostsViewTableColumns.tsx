import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { Button, Checkbox } from '@marchen/components/ui'
import { relativeTimeToNow, routerBuilder, Routes } from '@marchen/lib'
import type { Column, ColumnDef, Row } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'

import { useDeletePosts } from '../../hooks/use-delete-posts'
import { TableAction } from '../shared/TableAction'

export const postColumnsData: Array<ColumnDef<PostResponseType>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: '标题',
    cell: ({ row }) => {
      return (
        <Link
          href={routerBuilder(Routes.DASHBOARD_POSTS_EDIT, {
            id: row.original.id,
          })}
          className=" transition-colors hover:text-sky-600"
        >
          {row.original.title}
        </Link>
      )
    },
  },
  {
    accessorKey: 'category.name',
    header: '分类',
  },
  {
    accessorKey: 'tags',
    header: '标签',
  },
  {
    accessorKey: 'read',
    header: ({ column }) => {
      return <SortableHeader column={column} title="阅读量" />
    },
  },
  {
    accessorKey: 'created',
    header: ({ column }) => {
      return <SortableHeader column={column} title="创建时间" />
    },
    cell: ({ row }) => {
      return <div>{relativeTimeToNow(row.original.created)}</div>
    },
  },
  {
    accessorKey: 'updated',
    header: ({ column }) => {
      return <SortableHeader column={column} title="更新时间" />
    },
    cell: ({ row }) => {
      return <div>{relativeTimeToNow(row.original.updated)}</div>
    },
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      return <ActionCell row={row} />
    },
  },
]

export const SortableHeader = ({
  column,
  title,
}: {
  column: Column<any, unknown>
  title: string
}) => {
  return (
    <Button
      variant="link"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="pl-0"
    >
      {title}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  )
}

const ActionCell = ({ row }: { row: Row<PostResponseType> }) => {
  const { deletePosts } = useDeletePosts()

  const handleDeletePost = useCallback(() => {
    deletePosts(row.original.id)
  }, [deletePosts, row.original.id])

  return (
    <TableAction.Root>
      <TableAction.NormalItem>
        <Link
          href={routerBuilder(Routes.DASHBOARD_POSTS_EDIT, {
            id: row.original.id,
          })}
        >
          编辑博文
        </Link>
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem onClick={handleDeletePost}>
        删除
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}
