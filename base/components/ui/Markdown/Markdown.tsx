'use client'

import { cn } from '@base/lib/helper'
import { compiler } from 'markdown-to-jsx'
import type { ElementType, FC } from 'react'
import { useMemo } from 'react'

import styles from './markdown.module.css'
import { MCode } from './overrides/MCode'
import { MLink } from './overrides/MLink'

export interface MarkdownProps {
  content: string
  as?: ElementType
  className?: string
}

export const Markdown: FC<MarkdownProps> = (props) => {
  const { content, as: Component = 'div' } = props
  const node = useMemo(() => {
    const mdContent = compiler(content, {
      wrapper: null,
      overrides: {
        code: MCode,
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => <h2 className="text-xl">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg">{children}</h3>,
        p: ({ children }) => (
          <p className="my-4 text-base leading-7">{children}</p>
        ),
        a: MLink,
      },
    })
    return mdContent
  }, [content])
  return <Component className={cn(styles.markdown)}>{node}</Component>
}
