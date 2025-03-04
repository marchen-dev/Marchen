import { cn } from '@base/lib/helper'
import type { ComponentPropsWithRef } from 'react'

const HomeCard: Component<ComponentPropsWithRef<'div'>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('rounded-xl bg-base-100 p-4 drop-shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { HomeCard }
