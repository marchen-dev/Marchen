import { cn } from '@marchen/lib'
import * as React from 'react'

import type { LabelProps } from '../Label'
import { Label } from '../Label'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input dark:bg-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

const InputWithLabel = React.forwardRef<HTMLInputElement, LabelProps<'input'>>(
  ({ label, description, error, required, ...props }, ref) => {
    return (
      <div className="grid w-full items-center gap-2">
        <Label className={cn(error && 'text-red-500')}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Input {...props} ref={ref} />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

type InputWithIconProps = React.ComponentProps<'input'> & {
  icon?: React.ReactNode
  classNames?: { wrapper?: string }
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, classNames, type, icon, ...props }, ref) => {
    return (
      <div
        className={cn('relative flex items-center w-full', classNames?.wrapper)}
      >
        <Input {...props} ref={ref} />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
InputWithLabel.displayName = 'InputWithLabel'
InputWithIcon.displayName = 'InputWithIcon'
export { Input, InputWithIcon, InputWithLabel }
