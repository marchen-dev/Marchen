'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@marchen/components/ui'

import { AdvancedSetting } from './sheet/AdvancedSetting'
import { BasicSetting } from './sheet/BasicSetting'

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
        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={['basic', 'advanced']}
        >
          {settingSheetList.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className="font-semibold">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="px-1 pt-1">
                <item.component />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  )
}

const settingSheetList = [
  {
    title: '基本设置',
    value: 'basic',
    component: BasicSetting,
  },
  {
    title: '高级设置',
    value: 'advanced',
    component: AdvancedSetting,
  },
]
