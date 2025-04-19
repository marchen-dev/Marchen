'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@marchen/components/ui'
import { useAppTheme } from '@marchen/hooks'
import { cn } from '@marchen/lib'
import { useEffect, useState } from 'react'

export const HeaderTools = () => {
  return (
    <section className="flex items-center justify-center">
      <ThemeToggle />
    </section>
  )
}

export const ThemeToggle: Component = (props) => {
  const { className } = props
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
            className={cn('flex items-center', className)}
            onClick={() => toggleTheme()}
          >
            <i
              className={cn(
                isDarkMode
                  ? 'icon-[mingcute--moon-stars-line]'
                  : 'icon-[mingcute--sun-line]',
                'text-xl',
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
