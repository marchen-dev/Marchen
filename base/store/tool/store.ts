import type { StateCreator } from 'zustand'
import { devtools as zustandDevtools } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

import type { ViewPortStoreAction, ViewPortStoreState } from './slices/viewport'
import {
  createViewportStoreSlice,
  initialViewportStoreState,
} from './slices/viewport'

export type ToolStore = ViewPortStoreState & ViewPortStoreAction

const createStore: StateCreator<ToolStore, [['zustand/devtools', never]]> = (
  ...params
) => ({
  ...initialViewportStoreState,
  ...createViewportStoreSlice(...params),
})

const devtools = zustandDevtools(createStore)

export const useToolStore = createWithEqualityFn<ToolStore>()(devtools, shallow)
