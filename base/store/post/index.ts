import type { PostPaginationResponseType } from '@base/services/interfaces/post.interface'
import { createStore } from 'zustand'

export { usePostStore } from './store'

export const createPostStore = (
  init: Partial<PostPaginationResponseType> = {},
) => {
  return createStore<PostPaginationResponseType>()((_set) => ({
    total: 0,
    page: 1,
    pageSize: 10,
    data: [],
    ...init,
  }))
}
