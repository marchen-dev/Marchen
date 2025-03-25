import { Button } from '@base/components/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@base/components/ui/Command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@base/components/ui/Popover'
import { cn } from '@base/lib/helper'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { memo, useMemo, useState } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export const PostCategoryFilter = memo(() => {
  const categories = useAggregationDataSelector((state) => state?.category)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams()
  const currentCategory = useMemo(() => {
    return searchParams.get('category')
  }, []) // 只在路径改变时重新计算
  const [value, setValue] = useState(currentCategory)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? (
            categories?.find((category) => category.slug === value)?.name
          ) : (
            <span>全部类别</span>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="搜索分类..." />
          <CommandList>
            <CommandEmpty>没有找到分类</CommandEmpty>
            <CommandGroup>
              {categories?.map(({ id, name, slug }) => (
                <CommandItem
                  key={id}
                  value={slug}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                    router.push(
                      routerBuilder(Routes.POSTS, {
                        category: currentValue,
                      }),
                    )
                  }}
                >
                  {name}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === slug ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
