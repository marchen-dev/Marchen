import { useTheme } from 'next-themes'
import { useCallback } from 'react'

export type AppTheme = 'light' | 'dark'

export const useAppTheme = () => {
  const { setTheme, resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'
  const toggleTheme = useCallback(
    (theme?: AppTheme) => {
      if (!theme) {
        return setTheme(isDarkMode ? 'light' : 'dark')
      }
      setTheme(theme)
    },
    [isDarkMode, setTheme],
  )

  return { toggleTheme, resolvedTheme, isDarkMode }
}
