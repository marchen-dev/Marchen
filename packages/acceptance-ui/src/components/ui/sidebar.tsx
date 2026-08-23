import * as React from 'react'

import { cn } from '@/lib/utils'

function Sidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        'flex min-h-0 flex-col bg-sidebar text-sidebar-foreground',
        className,
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-2 p-3', className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)} {...props} />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-2 p-3', className)}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1 p-2', className)} {...props} />
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'px-2 py-1 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex flex-col gap-1', className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('group/menu-item relative', className)} {...props} />
}

function SidebarMenuButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 aria-current:bg-sidebar-accent aria-current:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
}
