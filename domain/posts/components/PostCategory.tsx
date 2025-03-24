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
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

import { usePostsSelector } from '../atom/selectors/posts-selector'

export const PostCategoryFilter = () => {
  const postData = usePostsSelector((state) => state.data)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? frameworks.find((framework) => framework.value === value)?.label
            : '选择分类'}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="搜索分类..." />
          <CommandList>
            <CommandEmpty>没有找到分类</CommandEmpty>
            <CommandGroup>
              {postData.map(({ category }) => (
                <CommandItem
                  key={category.id}
                  value={category.slug}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue)
                    setOpen(false)
                  }}
                >
                  {category.name}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === category.slug ? 'opacity-100' : 'opacity-0',
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
}

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
]
