'use client'

import './github-markdown.css'

import { cn } from '@base/lib/helper'
import { compiler } from 'markdown-to-jsx'
import type { ElementType, FC } from 'react'
import { useMemo } from 'react'

import { SyntaxHighlightedCode } from './overrides/SyntaxHighlightedCode'

export interface MarkdownProps {
  content: string
  as?: ElementType
  className?: string
}

export const Markdown: FC<MarkdownProps> = (props) => {
  const { content, as: Component = 'div', className } = props
  const node = useMemo(() => {
    const mdContent = compiler(content, {
      wrapper: null,
      overrides: {
        code: SyntaxHighlightedCode,
      },
    })
    return mdContent
  }, [content])
  return (
    <Component className={cn('markdown-body', className)}>{node}</Component>
  )
}
