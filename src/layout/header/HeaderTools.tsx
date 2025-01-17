'use client'

import { useAppTheme } from '@base/hooks/use-app-theme'
import { cn } from '@base/lib/helper'

export const HeaderTools = () => {
  const { isDarkMode, toggleTheme } = useAppTheme()
  return (
    <section className="flex items-center justify-center">
      <ul>
        <li>
          <button type="button" onClick={() => toggleTheme()}>
            <i
              className={cn(
                isDarkMode
                  ? 'icon-[mingcute--moon-stars-line]'
                  : 'icon-[mingcute--sun-line]',
                'text-xl',
              )}
            />
          </button>
        </li>
      </ul>
    </section>
  )
}
