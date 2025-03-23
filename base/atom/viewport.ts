import { atom } from 'jotai'

export const viewportAtom = atom({
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  width: 0,
  height: 0,
})
