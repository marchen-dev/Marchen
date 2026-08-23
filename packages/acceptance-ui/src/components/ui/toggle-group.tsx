'use client'

import type { VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const toggleGroupVariants = cva(
  'inline-flex w-fit items-center rounded-lg bg-muted p-0.5',
  {
    variants: {
      size: { sm: 'h-7', default: 'h-8' },
    },
    defaultVariants: { size: 'default' },
  },
)

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleGroupVariants>
>({})

function ToggleGroup({
  className,
  size,
  ...props
}: ToggleGroupPrimitive.Props<string> &
  VariantProps<typeof toggleGroupVariants>) {
  return (
    <ToggleGroupContext.Provider value={{ size }}>
      <ToggleGroupPrimitive
        className={cn(toggleGroupVariants({ size }), className)}
        {...props}
      />
    </ToggleGroupContext.Provider>
  )
}

function ToggleGroupItem({ className, ...props }: TogglePrimitive.Props) {
  const { size } = React.useContext(ToggleGroupContext)
  return (
    <TogglePrimitive
      className={cn(
        'inline-flex items-center justify-center rounded-md px-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-sm',
        size === 'sm' ? 'h-6' : 'h-7',
        className,
      )}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
