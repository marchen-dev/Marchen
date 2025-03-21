'use client'

import { usePostStore } from '@base/store/post'
import { PostCategoryFilter } from '@domain/posts/components/PostCategory'
import { PostsSearch } from '@domain/posts/components/PostSearch'
import { PostSort } from '@domain/posts/components/PostSort'
import { postPaginationQuery } from '@domain/posts/queries/post-pagination-query'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PostsPage() {
  const { data } = useQuery(postPaginationQuery())
  const setPostPagination = usePostStore((state) => state.setPostPagination)

  useEffect(() => {
    if (data) {
      setPostPagination(data)
    }
  }, [data])

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FilterArea />
      <PostListArea />
      <PaginationArea />
    </div>
  )
}

const FilterArea = () => {
  return (
    <div className="flex w-full items-center gap-2">
      <PostsSearch />
      <PostCategoryFilter />
      <PostSort />
    </div>
  )
}

const PostListArea = () => {
  const data = usePostStore((state) => state.data)
  return (
    <ul>
      {data?.map((item) => (
        <li key={item.id}>
          <Link href={`/posts/${item.id}`}>{item.title}</Link>
        </li>
      ))}
    </ul>
  )
}

const PaginationArea = () => {
  return <div>PaginationArea</div>
}
