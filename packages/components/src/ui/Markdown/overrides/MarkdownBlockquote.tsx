'use client'

import type { FC, PropsWithChildren } from 'react'

export const MarkdownBlockquote: FC<PropsWithChildren> = ({ children }) => {
  return (
    <blockquote className="my-6 border-l-4 border-zinc-300 bg-gray-50 px-6 py-px text-zinc-500 after:block after:content-[''] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
      {children}
    </blockquote>
  )
}
