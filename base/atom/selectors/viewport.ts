import type { ExtractAtomValue } from 'jotai'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { viewportAtom } from '../viewport'

export const useViewportSelector = <T>(
  selector: (value: ExtractAtomValue<typeof viewportAtom>) => T,
): T => {
  const viewport = useAtomValue(
    selectAtom(
      viewportAtom,
      useCallback((atomValue) => selector(atomValue), []),
    ),
  )
  return viewport
}
