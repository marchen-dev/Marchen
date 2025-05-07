'use client'

import { Button } from '@marchen/components/ui'
import { Plus } from 'lucide-react'

import { useEditFriendDialog } from '../hooks/use-friend-table'

export const FriendToolsArea = () => {
  const { onChange } = useEditFriendDialog()
  return (
    <div className="flex items-center justify-end gap-2">
      <Button onClick={() => onChange(true)} variant="outline">
        <Plus className="size-4" />
        添加
      </Button>
    </div>
  )
}
