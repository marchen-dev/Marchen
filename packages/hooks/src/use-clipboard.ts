import 'client-only'

import { useCallback, useRef, useState } from 'react'

interface UseClipboardProps {
  restoreTime?: number
  legacy?: boolean
}

export function useClipboard({
  restoreTime = 1000,
  legacy = true,
}: UseClipboardProps = {}) {
  const [copied, setCopied] = useState(false)
  const copyRestoreTimeRef = useRef<number | null>(null)

  const handleCopyResult = useCallback(
    (isCopied: boolean) => {
      if (copyRestoreTimeRef.current) {
        clearTimeout(copyRestoreTimeRef.current)
      }
      if (isCopied) {
        copyRestoreTimeRef.current = window.setTimeout(() => {
          setCopied(false)
        }, restoreTime)
      }
      setCopied(true)
    },
    [restoreTime],
  )

  const copy = useCallback(
    async (text: string) => {
      try {
        if (!('clipboard' in navigator)) {
          fallbackCopyTextToClipboard(text)
          return
        }
        try {
          await navigator.clipboard.writeText(text)
          handleCopyResult(true)
        } catch {
          try {
            fallbackCopyTextToClipboard(text)
          } catch (err) {
            console.error('Fallback method: Unable to copy', err)
          }
        }
      } catch (error) {
        console.error('Fallback method: Unable to copy', error)
      }
    },
    [handleCopyResult],
  )

  const fallbackCopyTextToClipboard = useCallback(
    (text: string) => {
      if (!legacy) {
        console.error(
          'Async Clipboard API not available, Please set legacy: true to use fallback.',
        )
        return false
      }
      console.warn('Async Clipboard API not available, using fallback.')

      const textArea = document.createElement('textarea')
      textArea.value = text

      textArea.style.position = 'fixed'
      textArea.style.top = '-9999px'
      textArea.style.left = '-9999px'
      textArea.style.width = '2em'
      textArea.style.height = '2em'
      textArea.style.padding = '0'
      textArea.style.border = 'none'
      textArea.style.outline = 'none'
      textArea.style.boxShadow = 'none'
      textArea.style.background = 'transparent'

      document.body.append(textArea)
      textArea.focus()
      textArea.select()

      let result = false
      try {
        result = document.execCommand('copy')
      } catch (err) {
        console.error('Fallback method: Unable to copy', err)
        result = false
      }
      if (result) {
        handleCopyResult(true)
      }

      textArea.remove()
      return result
    },
    [handleCopyResult],
  )

  const reset = useCallback(() => {
    setCopied(false)
    if (copyRestoreTimeRef.current) {
      clearTimeout(copyRestoreTimeRef.current)
    }
  }, [])
  return { copy, copied, reset }
}
