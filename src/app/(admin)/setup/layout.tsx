import { FullPageErrorAlert } from '@base/components/common/FullPageErrorAlert'
import { apiClient } from '@base/services'
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

  return <PortalLayout title="Marchen Blog">{props.children}</PortalLayout>
}
