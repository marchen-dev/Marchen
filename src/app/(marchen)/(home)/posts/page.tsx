'use client'

import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import { PostItem } from '@domain/home/components/shared/PostItem'
import { postsAtom } from '@domain/posts/atom/postsAtom'
import { usePostsSelector } from '@domain/posts/atom/selectors/posts-selector'
import { PostCategoryFilter } from '@domain/posts/components/PostCategory'
import { PostPaginationArea } from '@domain/posts/components/PostPagination'
import { PostsSearch } from '@domain/posts/components/PostSearch'
import { PostSort } from '@domain/posts/components/PostSort'
import { postPaginationQuery } from '@domain/posts/queries/post-pagination-query'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { memo, useEffect } from 'react'

export default function PostsPage() {
  const page = usePostsSelector((state) => state.page)
  const pageParams = useSearchParams().get('page')
  const { data } = useQuery(
    postPaginationQuery({
      page: pageParams ? Number.parseInt(pageParams as string) : page,
    }),
  )
  useBeforeMounted(() => {
    if (!data) {
      return
    }
    jotaiStore.set(postsAtom, data)
  })

  useEffect(() => {
    if (data) {
      jotaiStore.set(postsAtom, data)
    }
  }, [data])

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FilterArea />
      <PostListArea />
      <PostPaginationArea />
    </div>
  )
}

const FilterArea = memo(() => {
  return (
    <div className="flex w-full items-center gap-2">
      <PostsSearch />
      <PostCategoryFilter />
      <PostSort />
    </div>
  )
})

const PostListArea = memo(() => {
  const data = usePostsSelector((state) => state.data)
  return (
    <ul className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data?.map((item) => (
        <li key={item.id}>
          <PostItem post={item} />
        </li>
      ))}
    </ul>
  )
})
