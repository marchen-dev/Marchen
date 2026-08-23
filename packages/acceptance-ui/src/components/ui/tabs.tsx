'use client'

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex h-8 w-fit items-center rounded-lg bg-muted p-0.5',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        'inline-flex h-7 items-center justify-center rounded-md px-2.5 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-background data-active:text-foreground data-active:shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel className={cn('outline-none', className)} {...props} />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
