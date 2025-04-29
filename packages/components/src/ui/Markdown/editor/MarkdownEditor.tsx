'use client'

import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { useAppTheme } from '@marchen/hooks'
import { cn } from '@marchen/lib'
import { githubDark, githubLight } from '@uiw/codemirror-theme-github'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { memo, useCallback, useDeferredValue, useState } from 'react'

import { ScrollArea } from '../../ScrollArea'
import { Toggle } from '../../Toggle'
import { Markdown } from '../Markdown'

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
}

export const MarkdownEditor = memo(
  ({ value, onChange }: MarkdownEditorProps) => {
    const { isDarkMode } = useAppTheme()
    const [isPreview, setIsPreview] = useState(true)
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
      <div className="flex h-full flex-col  rounded-md border">
        <section className="flex items-center justify-end border-b p-1.5">
          <Toggle
            className="h-6 min-w-6 px-1.5"
            pressed={isPreview}
            onPressedChange={setIsPreview}
          >
            <i className="icon-[mingcute--layout-left-line] size-4" />
          </Toggle>
        </section>
        <ScrollArea className="h-full flex-1 basis-0">
          <section
            className={cn(
              'grid grid-cols-2  h-full gap-5 ',
              !isPreview && 'grid-cols-1',
            )}
          >
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

            {isPreview && <Markdown content={deferredEditorValue} />}
          </section>
        </ScrollArea>
      </div>
    )
  },
)
