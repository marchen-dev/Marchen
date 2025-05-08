'use client'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@marchen/components/ui'
import { MoreHorizontal } from 'lucide-react'

const Root = ({ children }: { children: React.ReactNode }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  )
}

const NormalItem = ({ children, onClick }: TableActionItemProps) => {
  return <DropdownMenuItem onClick={onClick}>{children}</DropdownMenuItem>
}

const Separator = () => {
  return <DropdownMenuSeparator />
}

const DestructiveItem = ({ children, onClick }: TableActionItemProps) => {
  return (
    <DropdownMenuItem className="!text-destructive" onClick={onClick}>
      {children}
    </DropdownMenuItem>
  )
}

interface TableActionItemProps {
  children: React.ReactNode
  onClick?: () => void
}

export const TableAction = {
  Root,
  NormalItem,
  Separator,
  DestructiveItem,
}
