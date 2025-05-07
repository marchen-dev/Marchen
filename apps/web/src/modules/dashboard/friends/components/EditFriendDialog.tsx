'use client'

import type { FriendResponseType } from '@marchen/api-client/interfaces/friend.interface'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  InputWithLabel,
} from '@marchen/components/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  useEditFriendDialog,
  useFriendTableMutation,
} from '~/modules/dashboard/friends/hooks/use-friend-table'

export const EditFriendDialog = () => {
  const { value, onChange } = useEditFriendDialog()
  const { isOpen, friend } = value
  const isEdit = !!friend?.id
  const form = useForm<FriendResponseType>()
  const {
    updateFriend: { mutate, isSuccess },
  } = useFriendTableMutation()

  useEffect(() => {
    form.setValue('name', friend?.name ?? '')
    form.setValue('url', friend?.url ?? '')
    form.setValue('avatar', friend?.avatar ?? '')
    form.setValue('introduce', friend?.introduce ?? '')
    form.setValue('email', friend?.email ?? '')
  }, [friend, form])

  useEffect(() => {
    if (isSuccess) {
      onChange(false)
      form.reset()
    }
  }, [isSuccess, onChange, form])

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[370px]" outSideClose={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑朋友' : '添加朋友'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改朋友信息' : '添加朋友信息'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => {
            mutate({ id: friend?.id, data })
            toast.success(isEdit ? '朋友信息修改成功' : '朋友信息添加成功')
          })}
        >
          <div className="flex flex-col gap-4 py-4">
            <InputWithLabel label="头像" {...form.register('avatar')} />
            <InputWithLabel label="名称" {...form.register('name')} />
            <InputWithLabel label="介绍" {...form.register('introduce')} />
            <InputWithLabel label="网址" {...form.register('url')} />
            <InputWithLabel label="邮箱" {...form.register('email')} />
          </div>

          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
