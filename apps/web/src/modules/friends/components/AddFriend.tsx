import { zodResolver } from '@hookform/resolvers/zod'
import type { Error } from '@marchen/api-client'
import { apiClient } from '@marchen/api-client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  InputWithLabel,
  Turnstile,
} from '@marchen/components/ui'
import { useClipboard } from '@marchen/hooks'
import { enableTurnstile } from '@marchen/lib'
import { useMutation } from '@tanstack/react-query'
import type { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useTurnstile } from 'react-turnstile'
import { toast } from 'sonner'
import type { z } from 'zod'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { friendSchema } from '../lib/friend-schema'

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
            <ul className="space-y-1 p-1">
              {siteInfoList.map((item) => (
                <SiteInfoItem key={item.label} {...item} />
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-base">申请友链</AccordionTrigger>
          <AccordionContent>
            <ApplyFriendLink />
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

const ApplyFriendLink = () => {
  const form = useForm<z.infer<typeof friendSchema>>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: '',
      url: '',
      introduce: '',
      email: '',
      avatar: '',
      captchaToken: '',
    },
  })
  const turnstile = useTurnstile()
  const { mutate: addFriend, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof friendSchema>) =>
      apiClient.friends.post(data),
    onSuccess: () => {
      toast.success('提交成功，请耐心等待博主审核')
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(error.data.message)
      turnstile.reset()
    },
  })
  const onSubmit = form.handleSubmit(
    async (data) => {
      addFriend(data)
    },
    (errors) => {
      // 处理验证错误
      const errorFields = Object.entries(errors)
      if (errorFields.length > 0) {
        const [field, error] = errorFields[0]
        toast.error(error?.message?.toString() || `${field}不能为空`)
      }
    },
  )
  return (
    <form className="p-1" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-3 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
        <InputWithLabel
          label="名称"
          required
          {...form.register('name')}
          placeholder="请输入站点名称"
          className="bg-white"
        />
        <InputWithLabel
          label="地址"
          required
          {...form.register('url')}
          placeholder="请输入站点地址"
          className="bg-white"
        />
        <InputWithLabel
          label="描述"
          required
          {...form.register('introduce')}
          placeholder="请输入站点描述"
          className="bg-white"
        />
        <InputWithLabel
          label="邮箱"
          required
          {...form.register('email')}
          placeholder="请输入邮箱"
          className="bg-white"
        />
        <InputWithLabel
          label="头像"
          required
          {...form.register('avatar')}
          placeholder="请输入头像地址"
          className="bg-white"
        />
      </div>
      <div className="mt-5 flex flex-col items-end gap-5">
        {enableTurnstile && (
          <Turnstile
            onVerify={(token) => {
              form.setValue('captchaToken', token)
            }}
          />
        )}
        <Button type="submit" disabled={isPending}>
          提交
        </Button>
      </div>
    </form>
  )
}
