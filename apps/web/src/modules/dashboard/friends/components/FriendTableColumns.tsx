import type {
  FriendResponseType,
  FriendStatus,
} from '@marchen/api-client/interfaces/friend.interface'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  UserAvatar,
} from '@marchen/components/ui'
import { relativeTimeToNow } from '@marchen/lib'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'

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
          className="!text-destructive"
          onClick={() => {
            updateStatus.mutate({ id: row.original.id, status: 'ARCHIVED' })
            toast.success('已归档')
          }}
        >
          归档
        </DropdownMenuItem>
        <DropdownMenuItem
          className="!text-destructive"
          onClick={() => {
            deleteFriend.mutate(row.original.id)
            toast.success('已删除')
          }}
        >
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PendingActionCell = ({ row }: { row: Row<FriendResponseType> }) => {
  // const { deleteCategory } = useCategoryMutation()
  const { deleteFriend, updateStatus } = useFriendTableMutation()
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
          <span
            onClick={() => {
              updateStatus.mutate({ id: row.original.id, status: 'ACCEPTED' })
              toast.success('已同意')
            }}
          >
            同意
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="!text-destructive"
          onClick={() => {
            deleteFriend.mutate(row.original.id)
            toast.success('已拒绝')
          }}
        >
          拒绝
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ArchivedActionCell = ({ row }: { row: Row<FriendResponseType> }) => {
  const { deleteFriend, updateStatus } = useFriendTableMutation()

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
          <span
            onClick={() => {
              updateStatus.mutate({ id: row.original.id, status: 'ACCEPTED' })
              toast.success('已恢复')
            }}
          >
            恢复
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="!text-destructive"
          onClick={() => {
            deleteFriend.mutate(row.original.id)
            toast.success('已删除')
          }}
        >
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
