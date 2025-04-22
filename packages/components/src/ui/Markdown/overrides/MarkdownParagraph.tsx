'use client'

import type { FC, PropsWithChildren } from 'react'
import * as React from 'react'

export const MarkdownParagraph: FC<PropsWithChildren> = ({ children }) => {
  if (React.Children.count(children) === 1) {
    // isImage
    const child = React.Children.toArray(children)[0]
    if (isImage(child)) {
      return children
    }
  }
  return <p className="my-4 text-base leading-7 ">{children}</p>
}

const isImage = (child: any) => {
  if (typeof child === 'object' && (child as any)?.props?.src) {
    return true
  }
  return false
}
