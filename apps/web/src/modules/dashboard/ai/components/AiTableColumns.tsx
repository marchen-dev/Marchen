import type { AiResponseType } from '@marchen/api-client/interfaces/ai.interface'
import { cn } from '@marchen/lib'
import type { ColumnDef, Row } from '@tanstack/react-table'

import { TableAction } from '../../posts/components/shared/TableAction'
import { useAiMutation, useEditAiDialog } from '../hooks/use-ai-table'

export const aiColumnsData: Array<ColumnDef<AiResponseType>> = [
  {
    accessorKey: 'provider',
    header: '提供商',
  },
  {
    accessorKey: 'apiUrl',
    header: 'API 地址',
    cell: ({ row }) => {
      return (
        <span>{row.original.system ? '系统默认' : row.original.apiUrl}</span>
      )
    },
  },
  {
    accessorKey: 'model',
    header: '模型',
  },
  {
    accessorKey: 'active',
    header: '状态',
    cell: ({ row }) => {
      const { active } = row.original
      return (
        <span className={cn(active && 'font-bold')}>
          {active ? '启用' : '禁用'}
        </span>
      )
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

const ActionCell = ({ row }: { row: Row<AiResponseType> }) => {
  const { onChange } = useEditAiDialog()
  const { deleteAi } = useAiMutation()
  return (
    <TableAction.Root>
      <TableAction.NormalItem onClick={() => onChange(true, row.original)}>
        编辑
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem
        onClick={() => deleteAi.mutate(row.original.id)}
      >
        删除
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}
