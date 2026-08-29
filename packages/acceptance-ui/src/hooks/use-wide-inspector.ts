import { useEffect, useState } from 'react'

import {
  INSPECTOR_BREAKPOINT,
  usesInlineInspector,
} from '@/lib/review-workbench'

/** 跟踪 1280px 检查器断点。 */
export function useWideInspector(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' ? false : usesInlineInspector(window.innerWidth),
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${INSPECTOR_BREAKPOINT}px)`,
    )
    const update = () => setWide(mediaQuery.matches)
    mediaQuery.addEventListener('change', update)
    update()
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return wide
}
