import type { CategoryResponseType } from '@marchen/api-client/interfaces/category.interface'
import type { ColumnDef, Row } from '@tanstack/react-table'

import {
  useCategoryMutation,
  useEditCategoryDialog,
} from '../../hooks/use-category'
import { TableAction } from '../shared/TableAction'
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
    <TableAction.Root>
      <TableAction.NormalItem onClick={() => onChange(true, row.original)}>
        编辑
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem
        onClick={() => deleteCategory(row.original.slug)}
      >
        删除
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}
