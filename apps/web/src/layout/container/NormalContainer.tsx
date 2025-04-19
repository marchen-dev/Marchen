import { cn } from '@marchen/lib'
import type { PropsWithChildren } from 'react'

interface NormalContainerProps extends PropsWithChildren {
  title?: string
  icon?: string
}

export const NormalContainer: Component<NormalContainerProps> = ({
  children,
  className,
  title,
  icon,
}) => {
  return (
    <div
      className={cn(
        'max-w-normal mx-auto min-w-0 overflow-hidden md:p-2',
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
