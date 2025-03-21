import type { StateCreator } from 'zustand'

import type { PostStore } from '../../store'
import type { PostPaginationStoreState } from './initialState'

export interface PostPaginationStoreAction {
  setPostPagination: (values: PostPaginationStoreState) => void
}

export const createPostPaginationStoreSlice: StateCreator<
  PostStore,
  [['zustand/devtools', never]],
  [],
  PostPaginationStoreAction
> = (set) => ({
  setPostPagination: (values) => {
    set((state) => ({ ...state, ...values }))
  },
})
