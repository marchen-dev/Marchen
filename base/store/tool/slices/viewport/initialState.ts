export interface ViewPortStoreState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  width: number
  height: number
}

export const initialViewportStoreState: ViewPortStoreState = {
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  width: 0,
  height: 0,
}
