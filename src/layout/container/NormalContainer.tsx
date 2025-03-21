import { cn } from '@base/lib/helper'
import type { PropsWithChildren } from 'react'

interface NormalContainerProps extends PropsWithChildren {
  title?: string
}

export const NormalContainer: Component<NormalContainerProps> = ({
  children,
  className,
  title,
}) => {
  return (
    <div
      className={cn(
        'mx-auto min-w-0 max-w-normal overflow-hidden p-2',
        className,
      )}
    >
      {title && (
        <div className="mb-3 flex items-center py-3">
          <i className="icon-[mingcute--book-6-line] mr-2 size-6" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}
      {children}
    </div>
  )
}
