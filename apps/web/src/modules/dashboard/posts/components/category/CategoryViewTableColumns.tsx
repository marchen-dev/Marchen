import type { CategoryResponseType } from '@marchen/api-client/interfaces/category.interface'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@marchen/components/ui'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import {
  useCategoryMutation,
  useEditCategoryDialog,
} from '../../hooks/use-category'
import { SortableHeader } from '../view/PostsViewTableColumns'

export const categoryColumnsData: Array<ColumnDef<CategoryResponseType>> = [
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'slug',
    header: '路径',
  },
  {
    accessorKey: '_count.posts',
    header: ({ column }) => {
      return <SortableHeader column={column} title="博文数量" />
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

const ActionCell = ({ row }: { row: Row<CategoryResponseType> }) => {
  const { onChange } = useEditCategoryDialog()

  const { deleteCategory } = useCategoryMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <span onClick={() => onChange(true, row.original)}>编辑</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="!text-destructive "
          onClick={() => deleteCategory(row.original.slug)}
        >
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
