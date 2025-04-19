import type { ExtractAtomValue } from 'jotai'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useCallback } from 'react'

import { postsAtom } from '../postsAtom'

export const usePostsSelector = <T>(
  selector: (value: ExtractAtomValue<typeof postsAtom>) => T,
): T => {
  const value = useAtomValue(
    selectAtom(
      postsAtom,
      useCallback((atomValue) => selector(atomValue), []),
    ),
  )
  return value
}
