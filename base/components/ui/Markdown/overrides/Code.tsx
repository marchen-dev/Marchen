import { useAppTheme } from '@base/hooks/use-app-theme'
import { cn } from '@base/lib/helper'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { toast } from 'sonner'

export function MCode({
  className,
  children,
}: {
  className: string
  children: string
}) {
  const { isDarkMode } = useAppTheme()
  const [style, setStyle] = useState(oneLight)
  useEffect(() => {
    setStyle(isDarkMode ? oneDark : oneLight)
  }, [isDarkMode])
  const language = className?.replace('lang-', '')
  if (!language) {
    return <InlineCodeBlock text={children} />
  }
  return (
    <div className="my-5 rounded-md bg-zinc-50 p-4 dark:bg-zinc-900">
      <CodeBlockHeader language={language} content={children} />
      <SyntaxHighlighter
        language={language}
        style={style}
        codeTagProps={{
          className: 'bg-zinc-50 dark:bg-zinc-900',
        }}
        PreTag={({ children }) => <div>{children}</div>}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

interface PreTagProps {
  language: string
  content: string
}

const CodeBlockHeader: FC<PreTagProps> = ({ content, language }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = (text: string) => {
    if (copied) return
    navigator.clipboard.writeText(text.toString())
    setCopied(true)
    toast.success('已复制')
    setTimeout(() => {
      setCopied(false)
    }, 5000)
  }
  return (
    <div className="mb-3  flex items-center justify-between text-xs">
      <span className=" text-zinc-500">{language}</span>
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-zinc-500  ',
          !copied && 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          copied && 'cursor-default',
        )}
        onClick={() => {
          handleCopy(content)
        }}
      >
        {copied ? (
          <>
            <i className="icon-[mingcute--check-line]" />
            <span>已复制</span>
          </>
        ) : (
          <>
            <i className="icon-[mingcute--copy-2-line]" />
            <span>复制</span>
          </>
        )}
      </button>
    </div>
  )
}

const InlineCodeBlock: FC<{ text: string }> = ({ text }) => {
  return (
    <code className="mx-1 rounded-md bg-muted px-1.5 py-0.5 text-sm">
      {text}
    </code>
  )
}
