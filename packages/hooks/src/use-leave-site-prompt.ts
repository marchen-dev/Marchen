import { useEffect } from 'react'

export function useLeaveSitePrompt(isDirty: boolean | (() => boolean)) {
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      const isChange = typeof isDirty === 'function' ? isDirty() : isDirty
      if (isChange) e.preventDefault()
    }

    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [isDirty])
}
