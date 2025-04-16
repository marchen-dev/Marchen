import { useViewportSelector } from '@marchen/atom'

export function useIsMobile() {
  const isMobile = useViewportSelector((state) => state.isMobile)
  return !!isMobile
}
