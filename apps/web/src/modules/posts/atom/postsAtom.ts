import type { PostPaginationResponseType } from '@marchen/api-client/interfaces/post.interface'
import type { InfiniteData } from '@tanstack/react-query'
import { atomWithReset } from 'jotai/utils'

export const postsAtom = atomWithReset<
  InfiniteData<PostPaginationResponseType, unknown>
>({
  pages: [],
  pageParams: [],
})
