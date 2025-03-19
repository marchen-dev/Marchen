import type { StateCreator } from 'zustand'

import type { UserStore } from '../../store'
import type { MasterStoreState } from './initialState'

export interface MasterStoreAction {
  setMaster: (values: MasterStoreState) => void
}

export const createMasterStoreSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  MasterStoreAction
> = (set) => ({
  setMaster: (values) => {
    set((state) => ({ ...state, ...values }))
  },
})
