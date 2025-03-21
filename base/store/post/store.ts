import type { StateCreator } from 'zustand'
import { devtools as zustandDevtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import type {
  PostPaginationStoreAction,
  PostPaginationStoreState,
} from './slices/pagination'
import {
  createPostPaginationStoreSlice,
  initialPostPaginationStoreState,
} from './slices/pagination'

export type PostStore = PostPaginationStoreState & PostPaginationStoreAction

const createStore: StateCreator<PostStore, [['zustand/devtools', never]]> = (
  ...params
) => ({
  ...initialPostPaginationStoreState,
  ...createPostPaginationStoreSlice(...params),
})

const devtools = zustandDevtools(createStore)

export const usePostStore = createWithEqualityFn<PostStore>()(devtools, shallow)
