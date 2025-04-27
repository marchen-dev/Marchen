'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@marchen/components/ui'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { SettingsProfileEditArea } from '~/modules/dashboard/settings/components/profile/SettingsProfileEditArea'
import { SettingsProfilePreviewArea } from '~/modules/dashboard/settings/components/profile/SettingsProfilePreviewArea'
import { useMasterData } from '~/providers/dashboard/MasterDataProvider'

export const profileSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  nickname: z.string().min(1, '昵称不能为空'),
  introduce: z.string().nullish(),
  email: z.string().email('邮箱格式不正确'),
  avatar: z.string().url('头像格式不正确'),
  social: z.record(z.string(), z.string()),
})

export default function SettingsUserPage() {
  const { email, name, nickname, introduce, avatar, social } = useMasterData()
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email,
      name,
      nickname,
      introduce,
      avatar,
      social,
    },
  })
  const { handleSubmit } = form

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    console.info(data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AppSidebarToolbarLayout toolsArea={<ToolsBar />}>
          <div className="grid max-w-screen-md grid-cols-2 gap-6">
            <SettingsProfileEditArea />
            <SettingsProfilePreviewArea />
          </div>
        </AppSidebarToolbarLayout>
      </form>
    </FormProvider>
  )
}

const ToolsBar = () => {
  return (
    <Button type="submit" variant="outline">
      <i className="icon-[mingcute--check-circle-line] size-4" />
      保存
    </Button>
  )
}
