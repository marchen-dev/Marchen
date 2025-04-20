import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@marchen/components/ui'
import { relativeTimeToNow, routerBuilder, Routes } from '@marchen/lib'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export const columnsData: Array<ColumnDef<PostResponseType>> = [
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
    header: '阅读量',
  },
  {
    accessorKey: 'created',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          创建时间
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{relativeTimeToNow(row.original.created)}</div>
    },
  },
  {
    accessorKey: 'updated',
    header: '更新时间',
    cell: ({ row }) => {
      return <div>{relativeTimeToNow(row.original.updated)}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={routerBuilder(Routes.DASHBOARD_POSTS_EDIT, {
                  id: row.original.id,
                })}
              >
                编辑博文
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
