'use client'

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { debounce } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'

import { Markdown } from '../Markdown'

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
}

export const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  const [editorValue, setEditorValue] = useState(value)

  const throttledUpdateMarkdown = useMemo(
    () =>
      debounce((value: string) => {
        setEditorValue(value)
      }, 300),
    [],
  )

  const handleInputChange = useCallback(
    (value: string) => {
      throttledUpdateMarkdown(value)
      onChange?.(value)
    },
    [throttledUpdateMarkdown, onChange],
  )

  return (
    <div className="grid h-full grid-cols-2 gap-5">
      <CodeMirror
        defaultValue={editorValue}
        height="100%"
        maxWidth="100%"
        theme={githubLight}
        extensions={[
          EditorView.lineWrapping,
          markdown({ base: markdownLanguage, codeLanguages: languages }),
        ]}
        onChange={handleInputChange}
      />
      <Markdown content={editorValue} />
    </div>
  )
}
