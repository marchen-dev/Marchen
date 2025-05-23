'use client'

import { cn } from '@marchen/lib'
import { compiler } from 'markdown-to-jsx'
import type { ElementType, FC } from 'react'
import { memo, useMemo } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../Table'
import styles from './markdown.module.css'
import { MarkdownBlockquote } from './overrides/MarkdownBlockquote'
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

export const Markdown: FC<MarkdownProps> = memo((props) => {
  const { content, as: Component = 'div' } = props
  const node = useMemo(() => {
    const mdContent = compiler(content, {
      wrapper: null,
      overrides: {
        code: MarkdownCode,
        p: MarkdownParagraph,
        a: MarkdownLink,
        img: MarkdownImage,
        thead: TableHeader,
        th: TableHead,
        tr: TableRow,
        tbody: TableBody,
        td: TableCell,
        table: Table,
        blockquote: MarkdownBlockquote,
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
        ul: ({ children }) => <ul className="list-disc pl-7">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-7">{children}</ol>,
      },
    })
    return mdContent
  }, [content])
  return (
    <Component className={cn(styles.markdown, props.className)}>
      {node}
    </Component>
  )
})
