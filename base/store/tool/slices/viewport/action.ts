import { throttle } from 'lodash-es'
import type { StateCreator } from 'zustand'

import type { ToolStore } from '../../store'
import type { ViewPortStoreState } from './initialState'

export interface ViewPortStoreAction {
  setViewPort: (
    values: Partial<Omit<ViewPortStoreState, 'setViewPort'>>,
  ) => void
  updateViewPort: () => void
}

export const createViewportStoreSlice: StateCreator<
  ToolStore,
  [['zustand/devtools', never]],
  [],
  ViewPortStoreAction
> = (set) => ({
  setViewPort: (values) => set((state) => ({ ...values, ...state })),
  updateViewPort: throttle(() => {
    const { innerWidth, innerHeight } = window
    return set({
      isMobile: innerWidth < 768,
      isTablet: innerWidth >= 768 && innerWidth < 1024,
      isDesktop: innerWidth >= 1024,
      isLargeDesktop: innerWidth >= 1440,
      width: innerWidth,
      height: innerHeight,
    })
  }, 200),
})
