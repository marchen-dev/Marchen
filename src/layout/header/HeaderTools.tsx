'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@base/components/ui/Tooltip'
import { useAppTheme } from '@base/hooks/use-app-theme'
import { cn } from '@base/lib/helper'
import { useEffect, useState } from 'react'

export const HeaderTools = () => {
  return (
    <section className="flex items-center justify-center">
      <ThemeToggle />
    </section>
  )
}

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useAppTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="flex items-center"
            onClick={() => toggleTheme()}
          >
            <i
              className={cn(
                isDarkMode
                  ? 'icon-[mingcute--moon-stars-line]'
                  : 'icon-[mingcute--sun-line]',
                'text-2xl',
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDarkMode ? '夜间模式' : '白天模式'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
