'use client'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { useMasterData } from '~/providers/dashboard/MasterDataProvider'

export default function DashboardPage() {
  const { name } = useMasterData()
  return (
    <AppSidebarToolbarLayout>
      <h1>{name}</h1>
    </AppSidebarToolbarLayout>
  )
}
