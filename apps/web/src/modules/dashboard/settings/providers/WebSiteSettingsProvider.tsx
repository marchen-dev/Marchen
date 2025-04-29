'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { apiClient } from '@marchen/api-client'
import { useMutation } from '@tanstack/react-query'
import type { FC } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { websiteSchema } from '../lib/settings-schema'

interface WebSiteSettingsProviderProps {
  children: React.ReactNode
  data: z.infer<typeof websiteSchema>
}

export const WebSiteSettingsProvider: FC<WebSiteSettingsProviderProps> = ({
  children,
  data,
}) => {
  const form = useForm<z.infer<typeof websiteSchema>>({
    resolver: zodResolver(websiteSchema),
    defaultValues: data,
  })
  const { handleSubmit } = form

  const { mutate: updateWebsite } = useMutation({
    mutationFn: (data: z.infer<typeof websiteSchema>) => {
      return apiClient.site.patch(data)
    },
    onSuccess: () => {
      toast.success('更新成功')
    },
    onError: () => {
      toast.error('更新失败')
    },
  })

  return (
    <FormProvider {...form}>
      <form className="" onSubmit={handleSubmit((data) => updateWebsite(data))}>
        {children}
      </form>
    </FormProvider>
  )
}
