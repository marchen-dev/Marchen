import { cn } from '@marchen/lib'
import * as React from 'react'

type InputProps = React.ComponentProps<'input'> & {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center w-full', className)}>
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-neutral-content px-3 py-1 text-base shadow-sm transition-colors file:border-0  file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            icon ? 'pr-10' : '',
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

Input.displayName = 'Input'

export { Input }
