'use client'

import { Input } from '@marchen/components/ui'

import { usePostsViewTable } from '../../providers/PostsViewTableProvider'

export const PostsViewTableHeader = () => {
  const { table } = usePostsViewTable()
  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="搜索标题"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-60"
        />
      </div>
    </div>
  )
}
