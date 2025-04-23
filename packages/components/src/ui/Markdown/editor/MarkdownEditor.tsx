'use client'

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { useAppTheme } from '@marchen/hooks'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { memo, useCallback, useDeferredValue, useState } from 'react'

import { Markdown } from '../Markdown'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
}

export const MarkdownEditor = memo(
  ({ value, onChange }: MarkdownEditorProps) => {
    const { isDarkMode } = useAppTheme()
    const [editorValue, setEditorValue] = useState(value ?? '')
    const deferredEditorValue = useDeferredValue(editorValue)
    const handleInputChange = useCallback(
      (value: string) => {
        setEditorValue(value)
        onChange?.(value)
      },
      [onChange],
    )
    return (
      <div className="grid h-full grid-cols-2 gap-5 rounded-md border border-zinc-200 dark:border-zinc-800">
        <CodeMirror
          value={editorValue}
          height="100%"
          maxWidth="100%"
          theme={isDarkMode ? githubDark : githubLight}
          extensions={[
            EditorView.lineWrapping,
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            EditorView.theme({
              '&.cm-focused': {
                outline: 'none',
              },
            }),
          ]}
          onChange={handleInputChange}
          className="border-r border-zinc-200 dark:border-zinc-800"
        />
        <Markdown content={deferredEditorValue} />
      </div>
    )
  },
)
