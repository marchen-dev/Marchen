import { cn } from '@base/lib/helper'
import type { ComponentPropsWithoutRef } from 'react'

export const ExternalLink: Component<ComponentPropsWithoutRef<'a'>> = (
  props,
) => {
  const { children, className, ...rest } = props
  return (
    <a
      className={cn('transition-colors hover:text-blue-600', className)}
      {...rest}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}
