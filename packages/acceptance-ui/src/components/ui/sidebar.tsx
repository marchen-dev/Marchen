'use client'

import type { VariantProps } from 'class-variance-authority'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import { PanelLeftIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = 'var(--acceptance-sidebar-width)'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3rem'

interface SidebarContextValue {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

/** 读取官方 SidebarProvider 提供的响应式导航状态。 */
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar 必须在 SidebarProvider 内使用。')
  return context
}

/** shadcn Sidebar 状态容器；状态仅保留在当前验收页会话中。 */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (onOpenChange) onOpenChange(nextOpen)
      else setInternalOpen(nextOpen)
    },
    [onOpenChange],
  )
  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((value) => !value)
    else setOpen(!open)
  }, [isMobile, open, setOpen])
  const state = open ? 'expanded' : 'collapsed'
  const value = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
    }),
    [isMobile, open, openMobile, setOpen, state, toggleSidebar],
  )

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-slot="sidebar-wrapper"
        className={cn(
          'group/sidebar-wrapper flex min-h-svh w-full bg-sidebar',
          className,
        )}
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

/** shadcn Sidebar；移动端自动切换为 Sheet，桌面端使用 offcanvas。 */
function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'none'
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-mobile="true"
          data-sidebar="sidebar"
          data-slot="sidebar"
          side={side}
          showCloseButton={false}
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground"
          style={{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>验收案例</SheetTitle>
            <SheetDescription>选择要检查的验收案例。</SheetDescription>
          </SheetHeader>
          <div className="flex h-full min-h-0 flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === 'collapsed' ? 'offcanvas' : ''}
      data-side={side}
      data-variant={variant}
      className="group peer hidden text-sidebar-foreground md:block"
    >
      <div
        data-slot="sidebar-gap"
        className="relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0"
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          'fixed inset-y-0 z-20 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          variant === 'floating' || variant === 'inset'
            ? 'p-2'
            : 'data-[side=left]:border-r data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full min-h-0 flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/** 切换案例 Sidebar。 */
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">切换案例导航</span>
    </Button>
  )
}

/** Sidebar 对应的主内容容器。 */
function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn('relative flex min-w-0 flex-1 flex-col bg-background', className)}
      {...props}
    />
  )
}

/** Sidebar 顶部区域。 */
function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-3', className)} {...props} />
}

/** Sidebar 底部区域。 */
function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 p-3', className)} {...props} />
}

/** Sidebar 可滚动内容区域。 */
function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-auto', className)} {...props} />
  )
}

/** Sidebar 内容分组。 */
function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('relative flex flex-col p-2', className)} {...props} />
}

/** Sidebar 分组标题。 */
function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<'div'> & React.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex h-8 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70',
          className,
        ),
      },
      props,
    ),
    render,
    state: { slot: 'sidebar-group-label', sidebar: 'group-label' },
  })
}

/** Sidebar 列表。 */
function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex min-w-0 flex-col gap-1', className)} {...props} />
}

/** Sidebar 列表项。 */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn('group/menu-item relative', className)} {...props} />
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button group/menu-button relative flex w-full items-center gap-2 overflow-hidden rounded-lg p-2 pl-3 text-left text-sm outline-none transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 disabled:pointer-events-none disabled:opacity-50 data-active:bg-background data-active:font-medium data-active:text-sidebar-accent-foreground data-active:shadow-sm data-active:ring-1 data-active:ring-sidebar-border data-active:before:bg-sidebar-primary [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
  {
    variants: {
      size: {
        default: 'min-h-9',
        sm: 'min-h-8 text-xs',
        lg: 'min-h-12',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

/** Sidebar 导航按钮，支持官方 isActive 和 Tooltip 语义。 */
function SidebarMenuButton({
  render,
  isActive = false,
  size = 'default',
  tooltip,
  className,
  ...props
}: useRender.ComponentProps<'button'> &
  React.ComponentProps<'button'> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()
  const component = useRender({
    defaultTagName: 'button',
    props: mergeProps<'button'>(
      { className: cn(sidebarMenuButtonVariants({ size }), className) },
      props,
    ),
    render: tooltip ? <TooltipTrigger render={render} /> : render,
    state: {
      slot: 'sidebar-menu-button',
      sidebar: 'menu-button',
      size,
      active: isActive,
    },
  })

  if (!tooltip) return component
  const content = typeof tooltip === 'string' ? { children: tooltip } : tooltip
  return (
    <Tooltip>
      {component}
      <TooltipContent side="right" hidden={state !== 'collapsed' || isMobile} {...content} />
    </Tooltip>
  )
}

/** Sidebar 内输入框。 */
function SidebarInput(props: React.ComponentProps<typeof Input>) {
  return <Input data-sidebar="input" className="h-8 shadow-none" {...props} />
}

/** Sidebar 内分隔线。 */
function SidebarSeparator(props: React.ComponentProps<typeof Separator>) {
  return <Separator data-sidebar="separator" className="mx-2 w-auto" {...props} />
}

/** Sidebar 菜单加载占位。 */
function SidebarMenuSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex h-9 items-center gap-2 px-2', className)} {...props}>
      <Skeleton className="size-4" />
      <Skeleton className="h-4 flex-1" />
    </div>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
