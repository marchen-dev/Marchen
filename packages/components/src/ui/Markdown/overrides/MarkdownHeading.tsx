'use client'

import { cn } from '@marchen/lib'
import type { FC } from 'react'
import { createElement, useId } from 'react'

interface MarkdownHeadingProps {
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
}

const classNameMap = {
  1: 'text-2xl font-bold',
  2: 'text-xl ',
  3: 'text-lg ',
  4: '',
  5: '',
  6: '',
}
const baseClassName = 'leading-6 mt-[35px] mb-[10px] pb-[5px] font-semibold'
export const MarkdownHeading: FC<MarkdownHeadingProps> = ({
  children,
  level,
}) => {
  const Tag = `h${level}` as const
  const rid = useId()
  return createElement(
    Tag,
    {
      className: cn(baseClassName, classNameMap[level]),
      id: `heading-${level}-${rid}`,
      'markdown-level': level,
    },
    children,
  )
}
