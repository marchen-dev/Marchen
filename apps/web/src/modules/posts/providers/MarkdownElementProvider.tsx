'use client'

import { createContextState } from 'foxact/context-state'
import type { FC, PropsWithChildren } from 'react'

const [ElementProvider, useMarkdownElement, useSetMarkdownElement] =
  createContextState<HTMLDivElement | null>(null)

const MarkdownElementProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ElementProvider>
      <MarkdownElement>{children}</MarkdownElement>
    </ElementProvider>
  )
}

const MarkdownElement: FC<PropsWithChildren> = ({ children }) => {
  const setMarkdownElement = useSetMarkdownElement()
  return <div ref={setMarkdownElement}>{children}</div>
}

export { MarkdownElementProvider, useMarkdownElement }
