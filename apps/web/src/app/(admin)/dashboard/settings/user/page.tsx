'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { apiClient } from '@marchen/api-client'
import type { UserPatchMasterRequestType } from '@marchen/api-client/interfaces/user.interface'
import { Separator } from '@marchen/components/ui'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import {
  AppSidebarToolbarLayout,
  ToolsBar,
} from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { SettingsProfileEditArea } from '~/modules/dashboard/settings/components/profile/SettingsProfileEditArea'
import { SettingsProfilePreviewArea } from '~/modules/dashboard/settings/components/profile/SettingsProfilePreviewArea'
import { profileSchema } from '~/modules/dashboard/settings/lib/settings-schema'
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

  const { mutate: patchMaster } = useMutation({
    mutationFn: (data: UserPatchMasterRequestType) =>
      apiClient.user.patchMaster(data),
    onSuccess: () => {
      toast.success('更新成功')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    patchMaster(data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AppSidebarToolbarLayout toolsArea={<ToolsBar title="更新" />}>
          <div className="relative ml-2 grid  max-w-normal grid-cols-1 justify-items-start gap-6 rounded-md md:grid-cols-2 md:border md:p-5">
            <SettingsProfileEditArea />
            <Separator
              orientation="vertical"
              className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 md:block"
            />
            <SettingsProfilePreviewArea />
          </div>
        </AppSidebarToolbarLayout>
      </form>
    </FormProvider>
  )
}
