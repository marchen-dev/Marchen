import { cn } from '@base/lib/helper'
import type { PropsWithChildren } from 'react'

interface NarrowContainerProps extends PropsWithChildren {
  title?: string
  icon?: string
}

export const NarrowContainer: Component<NarrowContainerProps> = ({
  children,
  className,
  title,
  icon,
}) => {
  return (
    <div
      className={cn(
        'mx-auto min-w-0 max-w-narrow overflow-hidden md:p-2',
        className,
      )}
    >
      {title && (
        <div className="mb-3 flex items-center py-3">
          <i className={cn('mr-2 size-6', icon)} />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
      {children}
    </div>
  )
}
