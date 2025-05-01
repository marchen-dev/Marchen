'use client'

import { Button, Input } from '@marchen/components/ui'
import { Routes } from '@marchen/lib'
import { Plus, Trash } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'

import { useDeletePosts } from '../../hooks/use-delete-posts'
import { usePostsViewTable } from '../../hooks/use-posts-view-table'

export const PostsViewTableHeader = () => {
  const { table } = usePostsViewTable()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { deletePosts } = useDeletePosts()
  const handleDeletePosts = useCallback(() => {
    deletePosts(selectedRows.map((row) => row.original.id))
  }, [deletePosts, selectedRows])
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center ">
        <Input
          placeholder="搜索标题"
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-60"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="destructive"
          onClick={handleDeletePosts}
          disabled={selectedRows.length === 0}
        >
          <Trash className="size-4" />
          删除
        </Button>
        <Button variant="outline" asChild>
          <Link href={Routes.DASHBOARD_POSTS_EDIT}>
            <Plus className="size-4" />
            新建
          </Link>
        </Button>
      </div>
    </div>
  )
}
