import { useViewportSelector } from '@base/atom/selectors/viewport'

export function useIsMobile() {
  const isMobile = useViewportSelector((state) => state.isMobile)
  return !!isMobile
}
