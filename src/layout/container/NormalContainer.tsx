import { cn } from '@base/lib/helper'

export const NormalContainer: Component = ({ children, className }) => {
  return (
    <div
      className={cn(
        'mx-auto min-w-0 max-w-normal overflow-hidden p-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
