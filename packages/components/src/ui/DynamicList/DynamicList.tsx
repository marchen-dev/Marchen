'use client'

import type { FC, PropsWithChildren } from 'react'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '../Button'
import { Input } from '../Input'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'

interface DynamicListProps {
  title: string
  disabled?: boolean
  value: string[]
  onChange: (value: string[]) => void
}

const DynamicList: FC<DynamicListProps> = ({
  title,
  value,
  onChange,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const handleDelete = useCallback(
    (item: string) => {
      onChange(value.filter((v) => v !== item))
    },
    [onChange, value],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const inputValue = inputRef.current?.value
      if (!inputValue) {
        return
      }
      if (value.includes(inputValue)) {
        toast.error('已存在')
        return
      }
      onChange([...value, inputValue])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onChange, value],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="truncate" disabled={disabled}>
          {value.length > 0 ? `共 ${value.length} 个` : '点击添加'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-2 w-80 ">
        <PopoverContentLayout title={title}>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input placeholder="请输入" ref={inputRef} className="h-8" />
            <Button type="submit" className="shrink-0" size="sm">
              添加
            </Button>
          </form>
          <ul className="flex flex-wrap gap-2">
            {value.map((item) => (
              <li key={item}>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(item)}
                  size="sm"
                >
                  <i className="icon-[mingcute--delete-2-line] text-base" />
                  {item}
                </Button>
              </li>
            ))}
          </ul>
        </PopoverContentLayout>
      </PopoverContent>
    </Popover>
  )
}

interface PopoverContentLayoutProps extends PropsWithChildren {
  title: string
}
export const PopoverContentLayout: FC<PopoverContentLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div className="grid gap-4">
      <h4 className="font-medium leading-none">{title}</h4>
      <div className="grid gap-4 ">{children}</div>
    </div>
  )
}

export { DynamicList }
