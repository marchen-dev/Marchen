import type { StateCreator } from 'zustand'
import { devtools as zustandDevtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import type { MasterStoreAction, MasterStoreState } from './slices/master'
import {
  createMasterStoreSlice,
  initialMasterStoreState,
} from './slices/master'

export type UserStore = MasterStoreState & MasterStoreAction

const createStore: StateCreator<UserStore, [['zustand/devtools', never]]> = (
  ...params
) => ({
  ...initialMasterStoreState,
  ...createMasterStoreSlice(...params),
})

const devtools = zustandDevtools(createStore)

export const useUserStore = createWithEqualityFn<UserStore>()(devtools, shallow)
