'use client'

import { useQuery } from '@tanstack/react-query'

import { DashboardContext } from '../hooks/use-dashboard'
import { dashboardQuery } from '../queries/dashboard-query'

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { data } = useQuery(dashboardQuery())
  if (!data) {
    return null
  }
  return <DashboardContext value={data}>{children}</DashboardContext>
}
