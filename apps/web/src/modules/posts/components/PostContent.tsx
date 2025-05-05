'use client'

import { jotaiStore } from '@marchen/atom'
import { createFadeInOutTransition } from '@marchen/components/ui'
import { m } from 'framer-motion'
import { useResetAtom } from 'jotai/utils'
import { memo, useEffect } from 'react'

import { PostItem } from '~/modules/home/components/shared/PostItem'

import { postsAtom } from '../atom/postsAtom'
import { usePostsSelector } from '../atom/selectors/posts-selector'
import { usePostsData } from '../hooks/use-posts-data'
import { usePostsSearchParams } from '../hooks/use-posts-params'
import { PostCategoryFilter } from './PostCategory'
import { PostPaginationArea } from './PostPagination'
import { PostsSearch } from './PostSearch'
import { PostSort } from './PostSort'

export default function PostsContent() {
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
  }, [data, resetPostsAtom])
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
  const { category, orderBy, search } = usePostsSearchParams()
  const postListTransition = createFadeInOutTransition({
    lcpOptimization: false,
  })

  return (
    <m.ul
      className="mt-3 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
      {...postListTransition}
      key={`${search}-${category}-${orderBy}`}
    >
      {pagesData.map((page) =>
        page?.data?.posts?.map((postItem) => (
          <m.li key={postItem.id}>
            <PostItem post={postItem} />
          </m.li>
        )),
      )}
    </m.ul>
  )
})
