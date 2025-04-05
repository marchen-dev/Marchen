import { useLayoutEffect, useState } from 'react'
import type { BundledLanguage } from 'shiki/bundle/web'

import { highlight } from './shared'

// 自定义代码块组件
export function SyntaxHighlightedCode({
  className,
  children,
}: {
  className: string
  children: string
}) {
  const [nodes, setNodes] = useState(children)
  const language = className?.replace('lang-', '')
  useLayoutEffect(() => {
    void highlight(children, language as BundledLanguage).then((result) => {
      setNodes(result as unknown as string)
    })
  }, [children, language])

  return nodes ?? <p>Loading...</p>
}
