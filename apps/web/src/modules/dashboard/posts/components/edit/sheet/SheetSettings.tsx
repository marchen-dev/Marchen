import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import type { PropsWithChildren, ReactNode } from 'react'
import { forwardRef } from 'react'

interface FieldLayoutProps extends PropsWithChildren {
  title?: ReactNode
  className?: string
}

const SheetSettingRoot = ({ children }: PropsWithChildren) => {
  return <div className="space-y-3">{children}</div>
}

const SheetSettingItem = ({
  ref,
  children,
  title,
  className,
}: FieldLayoutProps & { ref?: React.RefObject<HTMLDivElement> }) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-10', className)}
      ref={ref}
    >
      <span className="shrink-0 font-medium">{title}</span>
      {children}
    </div>
  )
}

interface SelectGroup {
  label: string
  value: string
}

interface SheetSelectProps {
  placeholder?: string
  groups: SelectGroup[]
  defaultValue: string
  onValueChange: (value: string) => void
  ref?: React.RefObject<HTMLSelectElement>
}

const SheetSettingSelect = forwardRef<HTMLButtonElement, SheetSelectProps>(
  (props, ref) => {
    const { placeholder, groups, defaultValue, onValueChange } = props

    return (
      <Select defaultValue={defaultValue} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-[160px]" ref={ref}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groups.map((group) => (
              <SelectItem key={group.label} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  },
)
SheetSettingSelect.displayName = 'SheetSettingSelect'

export const SheetSettings = {
  Root: SheetSettingRoot,
  Item: SheetSettingItem,
  Select: SheetSettingSelect,
}
