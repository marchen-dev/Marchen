import type { ExtractAtomValue } from 'jotai'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { postAtom } from '../postAtom'

export const usePostSelector = <T>(
  selector: (value: ExtractAtomValue<typeof postAtom>) => T,
): T => {
  const value = useAtomValue(
    selectAtom(
      postAtom,
      useCallback((atomValue) => selector(atomValue), []),
    ),
  )
  return value
}
