'use client'

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'

import { cn } from '@/lib/utils'

function Collapsible(props: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger(props: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
  )
}

function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        'overflow-hidden data-open:animate-in data-open:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
