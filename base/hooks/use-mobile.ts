import { useToolStore } from '@base/store/tool'

export function useIsMobile() {
  const isMobile = useToolStore((state) => state.isMobile)
  return !!isMobile
}
