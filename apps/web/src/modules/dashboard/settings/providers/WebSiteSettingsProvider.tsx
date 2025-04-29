'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import type { FC } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
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

  const onSubmit = (data: z.infer<typeof websiteSchema>) => {
    console.info(data)
  }
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="size-full">
        {children}
      </form>
    </FormProvider>
  )
}
