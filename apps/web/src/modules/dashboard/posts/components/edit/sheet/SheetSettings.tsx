import {
  AIIcon,
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
  onRefresh?: () => void
  disabled?: boolean
}

const SheetSettingRoot = ({ children }: PropsWithChildren) => {
  return <div className="space-y-3">{children}</div>
}

const SheetSettingItem = ({
  ref,
  children,
  title,
  className,
  onRefresh,
  disabled,
}: FieldLayoutProps & { ref?: React.RefObject<HTMLDivElement> }) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-10', className)}
      ref={ref}
    >
      <div className="flex items-center gap-1 font-medium">
        <span>{title}</span>
        {onRefresh && (
          <AIIcon
            disabled={disabled}
            onClick={() => {
              onRefresh()
            }}
          />
        )}
      </div>
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
  value: string
  onValueChange: (value: string) => void
  ref?: React.RefObject<HTMLSelectElement>
  disabled?: boolean
}

const SheetSettingSelect = forwardRef<HTMLButtonElement, SheetSelectProps>(
  (props, ref) => {
    const { placeholder, groups, value, onValueChange, disabled } = props

    return (
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
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
