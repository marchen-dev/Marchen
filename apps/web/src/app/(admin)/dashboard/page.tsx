'use client'

import { useMasterData } from '~/providers/dashboard/MasterDataProvider'

export default function DashboardPage() {
  const { name } = useMasterData()
  return (
    <div>
      <h1>{name}</h1>
    </div>
  )
}
