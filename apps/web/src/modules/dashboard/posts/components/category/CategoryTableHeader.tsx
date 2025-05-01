'use client'

import { Button, Input } from '@marchen/components/ui'
import { Plus } from 'lucide-react'

import {
  useCategoryViewTable,
  useEditCategoryDialog,
} from '../../hooks/use-category'

export const CategoryTableHeader = () => {
  const { table } = useCategoryViewTable()
  const { onChange } = useEditCategoryDialog()

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center ">
        <Input
          placeholder="搜索分类"
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-60"
        />
      </div>
      <Button variant="outline" onClick={() => onChange(true)}>
        <Plus className="size-4" />
        新建
      </Button>
    </div>
  )
}
