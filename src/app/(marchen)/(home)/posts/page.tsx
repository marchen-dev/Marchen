'use client'

import { jotaiStore } from '@base/atom'
import { PostItem } from '@domain/home/components/shared/PostItem'
import { postsAtom } from '@domain/posts/atom/postsAtom'
import { usePostsSelector } from '@domain/posts/atom/selectors/posts-selector'
import { PostCategoryFilter } from '@domain/posts/components/PostCategory'
import { PostPaginationArea } from '@domain/posts/components/PostPagination'
import { PostsSearch } from '@domain/posts/components/PostSearch'
import { PostSort } from '@domain/posts/components/PostSort'
import { usePostsData } from '@domain/posts/hooks/use-posts-data'
import { useResetAtom } from 'jotai/utils'
import { memo, useEffect } from 'react'

export default function PostsPage() {
  const resetPostsAtom = useResetAtom(postsAtom)
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePostsData()
  useEffect(() => {
    if (data) {
      jotaiStore.set(postsAtom, data)
    }
    return () => {
      resetPostsAtom()
    }
  }, [data])
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <FilterArea />
      <PostListArea />
      <PostPaginationArea
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
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
  const pagesData = usePostsSelector((state) => state.pages)
  return (
    <ul className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {pagesData.map((page) =>
        page?.data?.posts?.map((item) => (
          <li key={item.id}>
            <PostItem post={item} />
          </li>
        )),
      )}
    </ul>
  )
})
