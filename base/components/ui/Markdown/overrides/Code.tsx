import { useAppTheme } from '@base/hooks/use-app-theme'
import type { FC, PropsWithChildren } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism'

export function CodeBlock({
  className,
  children,
}: {
  className: string
  children: string
}) {
  const { isDarkMode } = useAppTheme()
  const codeBlock = className?.replace('lang-', '')
  if (!codeBlock) {
    return <InlineCodeBlock text={children} />
  }

  return (
    <SyntaxHighlighter
      language={codeBlock}
      style={isDarkMode ? oneDark : oneLight}
    >
      {children}
    </SyntaxHighlighter>
  )
}

const InlineCodeBlock: FC<{ text: string }> = ({ text }) => {
  return (
    <code className="mx-1 rounded-md bg-muted px-1.5 py-0.5 text-sm">
      {text}
    </code>
  )
}

export const Code: FC<PropsWithChildren> = ({ children, ...rest }) => {
  if (
    typeof children === 'object' &&
    children !== null &&
    'type' in children &&
    children.type === 'code'
  ) {
    const props = children.props as { className: string; children: string }
    return CodeBlock(props)
  }
  return <pre {...rest}>{children}</pre>
}
