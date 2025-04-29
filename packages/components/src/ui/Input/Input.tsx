import { cn } from '@marchen/lib'
import * as React from 'react'

import { Label } from '../Label'

type InputProps = React.ComponentProps<'input'> & {
  icon?: React.ReactNode
  classNames?: { wrapper?: string }
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, classNames, ...props }, ref) => {
    return (
      <div
        className={cn('relative flex items-center w-full', classNames?.wrapper)}
      >
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-neutral-content px-3 py-1 text-base shadow-sm transition-colors file:border-0  file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            icon ? 'pr-10' : '',
            className,
          )}
          ref={ref}
          {...props}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
    )
  },
)

type InputWithLabelProps = InputProps & {
  label: string
  description?: string
  error?: string
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ className, type, icon, label, description, error, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-2">
        <Label className={cn(error && 'text-red-500')}>{label}</Label>
        <Input {...props} ref={ref} />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
InputWithLabel.displayName = 'InputWithLabel'
export { Input, InputWithLabel }
