'use client'

import { Label } from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import type { FC, PropsWithChildren } from 'react'

interface WrapperWithLabelProps extends PropsWithChildren {
  label: string
  description?: string
  error?: string
}

export const WrapperWithLabel: FC<WrapperWithLabelProps> = ({
  label,
  description,
  error,
  children,
}) => {
  return (
    <div className="grid w-full items-center gap-2">
      <Label className={cn(error && 'text-red-500')}>{label}</Label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
