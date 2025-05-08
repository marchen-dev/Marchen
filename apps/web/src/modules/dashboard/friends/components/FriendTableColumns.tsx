import type {
  FriendResponseType,
  FriendStatus,
} from '@marchen/api-client/interfaces/friend.interface'
import { UserAvatar } from '@marchen/components/ui'
import { relativeTimeToNow } from '@marchen/lib'
import type { ColumnDef, Row } from '@tanstack/react-table'

import { TableAction } from '../../posts/components/shared/TableAction'
import {
  useEditFriendDialog,
  useFriendTableMutation,
} from '../hooks/use-friend-table'

export const friendColumnsData = (
  type: FriendStatus,
): Array<ColumnDef<FriendResponseType>> => {
  switch (type) {
    case 'ACCEPTED': {
      return [
        ...basicColumnsData,
        {
          id: 'actions',
          header: '操作',
          cell: ({ row }) => {
            return <AcceptedActionCell row={row} />
          },
        },
      ]
    }
    case 'PENDING': {
      return [
        ...basicColumnsData,
        {
          id: 'actions',
          header: '操作',
          cell: ({ row }) => {
            return <PendingActionCell row={row} />
          },
        },
      ]
    }
    case 'ARCHIVED': {
      return [
        ...basicColumnsData,
        {
          id: 'actions',
          header: '操作',
          cell: ({ row }) => {
            return <ArchivedActionCell row={row} />
          },
        },
      ]
    }
  }
}
const basicColumnsData = [
  {
    accessorKey: 'avatar',
    header: '头像',
    cell: ({ row }: { row: Row<FriendResponseType> }) => {
      return (
        <UserAvatar
          src={row.original.avatar}
          alt={row.original.name}
          width={35}
          height={35}
          className="min-h-[35px] min-w-[35px]"
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: '名称',
  },
  {
    accessorKey: 'introduce',
    header: '介绍',
  },
  {
    accessorKey: 'url',
    header: '网址',
    cell: ({ row }: { row: Row<FriendResponseType> }) => {
      return (
        <a
          href={row.original.url}
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-blue-500"
        >
          {row.original.url}
        </a>
      )
    },
  },
  {
    accessorKey: 'email',
    header: '邮箱',
  },
  {
    accessorKey: 'createdAt',
    header: '申请日期',
    cell: ({ row }: { row: Row<FriendResponseType> }) => {
      return <span>{relativeTimeToNow(row.original.created)}</span>
    },
  },
]

const AcceptedActionCell = ({ row }: { row: Row<FriendResponseType> }) => {
  const { deleteFriend, updateStatus } = useFriendTableMutation()
  const { onChange } = useEditFriendDialog()

  return (
    <TableAction.Root>
      <TableAction.NormalItem onClick={() => onChange(true, row.original)}>
        编辑
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem
        onClick={() => {
          updateStatus.mutate({ id: row.original.id, status: 'ARCHIVED' })
        }}
      >
        归档
      </TableAction.DestructiveItem>
      <TableAction.DestructiveItem
        onClick={() => {
          deleteFriend.mutate(row.original.id)
        }}
      >
        删除
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}

const PendingActionCell = ({ row }: { row: Row<FriendResponseType> }) => {
  const { deleteFriend, updateStatus } = useFriendTableMutation()

  return (
    <TableAction.Root>
      <TableAction.NormalItem
        onClick={() => {
          updateStatus.mutate({ id: row.original.id, status: 'ACCEPTED' })
        }}
      >
        同意
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem
        onClick={() => {
          deleteFriend.mutate(row.original.id)
        }}
      >
        拒绝
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}

const ArchivedActionCell = ({ row }: { row: Row<FriendResponseType> }) => {
  const { deleteFriend, updateStatus } = useFriendTableMutation()

  return (
    <TableAction.Root>
      <TableAction.NormalItem
        onClick={() => {
          updateStatus.mutate({ id: row.original.id, status: 'ACCEPTED' })
        }}
      >
        恢复
      </TableAction.NormalItem>
      <TableAction.Separator />
      <TableAction.DestructiveItem
        onClick={() => {
          deleteFriend.mutate(row.original.id)
        }}
      >
        删除
      </TableAction.DestructiveItem>
    </TableAction.Root>
  )
}
