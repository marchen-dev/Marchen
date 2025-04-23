'use client'

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@marchen/components/ui'

export const EditorToolsArea = () => {
  return (
    <div className="flex gap-2">
      <SettingsSheet />
      <Button type="submit" variant="outline">
        <i className="icon-[mingcute--telegram-line] size-4" />
        发布
      </Button>
    </div>
  )
}

const SettingsSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <i className="icon-[mingcute--settings-3-line] size-4" />
          设置
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>设置</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <HorizontalSelect />
        </div>
      </SheetContent>
    </Sheet>
  )
}

const HorizontalSelect = () => {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium">分类</span>
      <Select>
        <SelectTrigger className="h-9 w-[150px]">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
          <SelectItem value="system">System</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
