import * as React from 'react'

import { cn } from '@/lib/utils'

/** shadcn Skeleton：为异步内容提供低干扰占位。 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  )
}

export { Skeleton }
