import { apiClient } from '@marchen/api-client'
import { FullPageErrorAlert } from '@marchen/components/common'
import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { PortalLayout } from '~/layout/dashboard/PortalLayout'

export const metadata: Metadata = {
  title: '初始化',
}
export default async function SetupLayout(props: PropsWithChildren) {
  const initialized = await apiClient.user.get().catch(() => {
    return false
  })

  if (initialized) {
    return <FullPageErrorAlert message="主人已经存在" />
  }

  return <PortalLayout title="Marchen 初始化">{props.children}</PortalLayout>
}
