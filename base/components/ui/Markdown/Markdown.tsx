'use client'

import { cn } from '@base/lib/helper'
import { compiler } from 'markdown-to-jsx'
import type { ElementType, FC } from 'react'
import { useMemo } from 'react'

import styles from './markdown.module.css'
import { MarkdownCode } from './overrides/MarkdownCode'
import { MarkdownHeading } from './overrides/MarkdownHeading'
import { MarkdownImage } from './overrides/MarkdownImage'
import { MarkdownLink } from './overrides/MarkdownLink'
import { MarkdownParagraph } from './overrides/MarkdownParagraph'

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
        code: MarkdownCode,
        h1: ({ children }) => (
          <MarkdownHeading level={1}>{children}</MarkdownHeading>
        ),
        h2: ({ children }) => (
          <MarkdownHeading level={2}>{children}</MarkdownHeading>
        ),
        h3: ({ children }) => (
          <MarkdownHeading level={3}>{children}</MarkdownHeading>
        ),
        h4: ({ children }) => (
          <MarkdownHeading level={4}>{children}</MarkdownHeading>
        ),
        h5: ({ children }) => (
          <MarkdownHeading level={5}>{children}</MarkdownHeading>
        ),
        h6: ({ children }) => (
          <MarkdownHeading level={6}>{children}</MarkdownHeading>
        ),
        p: MarkdownParagraph,
        a: MarkdownLink,
        img: MarkdownImage,
      },
    })
    return mdContent
  }, [content])
  return <Component className={cn(styles.markdown)}>{node}</Component>
}
