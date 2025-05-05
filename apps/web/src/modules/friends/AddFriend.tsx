import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@marchen/components/ui'
import { useClipboard } from '@marchen/hooks'
import type { FC } from 'react'
import { toast } from 'sonner'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export const AddFriend = () => {
  const site = useAggregationDataSelector((state) => state?.site)
  const { title, description, favicon, url } = site ?? {}

  const siteInfoList = [
    { label: '名称', value: title },
    { label: '描述', value: description },
    { label: '图标', value: favicon },
    { label: '地址', value: url },
  ]
  return (
    <section className="mt-8">
      <h3 className="text-lg font-medium">想和我交朋友？</h3>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-base">本站信息</AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1">
              {siteInfoList.map((item) => (
                <SiteInfoItem key={item.label} {...item} />
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-base">申请友链</AccordionTrigger>
          <AccordionContent>
            <p>申请友链</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}

const SiteInfoItem: FC<{ label?: string; value?: string }> = ({
  label,
  value,
}) => {
  const { copy, copied } = useClipboard({ restoreTime: 5000 })
  return (
    <li className="flex items-center gap-2">
      {label}：{value}
      <button
        type="button"
        className="flex items-center"
        onClick={() => {
          if (copied) return
          copy(value ?? '')
          toast.success('已复制')
        }}
      >
        {copied ? (
          <i className="icon-[mingcute--check-line]" />
        ) : (
          <i className="icon-[mingcute--copy-2-line]" />
        )}
      </button>
    </li>
  )
}
