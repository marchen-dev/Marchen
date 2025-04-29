'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@marchen/components/ui'
import { FormProvider, useForm } from 'react-hook-form'
import type { z } from 'zod'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { SettingsProfileEditArea } from '~/modules/dashboard/settings/components/profile/SettingsProfileEditArea'
import { SettingsProfilePreviewArea } from '~/modules/dashboard/settings/components/profile/SettingsProfilePreviewArea'
import { profileSchema } from '~/modules/dashboard/settings/lib/schema'
import { useMasterData } from '~/providers/dashboard/MasterDataProvider'

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
          <div className="ml-2 grid max-w-normal grid-cols-2  justify-items-start gap-6">
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
