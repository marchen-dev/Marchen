'use client'

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { XIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Sheet(props: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(props: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 isolate bg-black/20 duration-200 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'fixed flex flex-col bg-background text-foreground shadow-xl ring-1 ring-foreground/10 duration-200 outline-none data-open:animate-in data-closed:animate-out data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:w-[min(28rem,calc(100%-1rem))] data-[side=right]:data-open:slide-in-from-right data-[side=right]:data-closed:slide-out-to-right data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:w-[min(20rem,calc(100%-1rem))] data-[side=left]:data-open:slide-in-from-left data-[side=left]:data-closed:slide-out-to-left data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:max-h-[85vh] data-[side=bottom]:rounded-t-xl data-[side=bottom]:data-open:slide-in-from-bottom data-[side=bottom]:data-closed:slide-out-to-bottom data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:data-open:slide-in-from-top data-[side=top]:data-closed:slide-out-to-top',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3"
              />
            }
          >
            <XIcon />
            <span className="sr-only">关闭</span>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex shrink-0 flex-col gap-1.5 border-b p-5', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-col gap-2 border-t p-4',
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-base font-medium', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
