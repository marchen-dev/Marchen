import type { PostPaginationResponseType } from '@base/services/interfaces/post.interface'
import { atom } from 'jotai'

import { DEFAULT_POST_PAGINATION_PARAMS } from '../queries/post-pagination-query'

export const postsAtom = atom<PostPaginationResponseType>({
  total: 0,
  page: DEFAULT_POST_PAGINATION_PARAMS.page,
  pageSize: DEFAULT_POST_PAGINATION_PARAMS.pageSize,
  totalPages: 0,
  data: [],
})
