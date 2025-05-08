'use client'

import { cn } from '@marchen/lib'
import type { FC } from 'react'

import type { LabelProps } from '../Label'
import { Label } from '../Label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select'

interface SelectGroup {
  label: string
  value: string
  default?: boolean
}

interface selectProps {
  placeholder?: string
  groups: SelectGroup[]
  defaultValue: string
  onValueChange: (value: string) => void
}
export const SelectWithLabel: FC<LabelProps<'button'> & selectProps> = ({
  label,
  description,
  error,
  required,
  groups,
  placeholder,
  defaultValue,
  onValueChange,
  disabled,
}) => {
  return (
    <div className="mt-2 grid w-full items-center gap-2.5">
      <Label className={cn(error && 'text-red-500')}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 w-[150px]">
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
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
