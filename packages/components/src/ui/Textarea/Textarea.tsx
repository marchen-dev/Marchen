import { cn } from '@marchen/lib'
import * as React from 'react'
import type { TextareaAutosizeProps } from 'react-textarea-autosize'
import TextareaAutosize from 'react-textarea-autosize'

import { Label } from '../Label'

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

type TextAreaWithLabelProps = TextareaAutosizeProps & {
  label: string
  description?: string
  error?: string
}

const TextAreaWithLabel = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaWithLabelProps
>(({ className, label, description, error, ...props }, ref) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label className={cn('mb-1', error && 'text-red-500 ')}>{label}</Label>
      <Textarea {...props} ref={ref} />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
})

export { Textarea, TextAreaWithLabel }
