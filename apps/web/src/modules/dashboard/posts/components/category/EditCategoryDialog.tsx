'use client'

import type { CategoryResponseType } from '@marchen/api-client/interfaces/category.interface'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@marchen/components/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import {
  useCategoryMutation,
  useEditCategoryDialog,
} from '../../hooks/use-category'

export const EditCategoryDialog = () => {
  const { value, onChange } = useEditCategoryDialog()
  const { isOpen, category } = value
  const form = useForm<CategoryResponseType>()
  const {
    categoryMutation: { mutate, isSuccess },
  } = useCategoryMutation()

  useEffect(() => {
    form.setValue('name', category?.name ?? '')
    form.setValue('slug', category?.slug ?? '')
  }, [category, form])

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
          <DialogTitle>编辑分类</DialogTitle>
          <DialogDescription>修改分类名称和路径</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) =>
            mutate({ data, id: category?.id }),
          )}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                名称
              </Label>
              <Input className="col-span-3" {...form.register('name')} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                路径
              </Label>
              <Input className="col-span-3" {...form.register('slug')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
