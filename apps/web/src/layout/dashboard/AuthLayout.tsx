import { apiClient } from '@marchen/api-client'
import { redirect } from 'next/navigation'
import type { PropsWithChildren } from 'react'

import { MasterDataProvider } from '../../providers/dashboard/MasterDataProvider'

export const AuthenticatedLayout: React.FC<PropsWithChildren> = async (
  props,
) => {
  const master = await apiClient.user.master().catch(() => {
    return redirect('/login')
  })

  return (
    <MasterDataProvider value={master}>{props.children}</MasterDataProvider>
  )
}
