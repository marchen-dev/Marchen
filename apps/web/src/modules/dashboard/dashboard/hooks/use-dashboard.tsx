'use client'

import type { GetDashboardResponseType } from '@marchen/api-client/interfaces/aggregate.interface'
import { createContext, use } from 'react'

export const DashboardContext = createContext<GetDashboardResponseType | null>(
  null,
)

export const useDashboardData = () => {
  const context = use(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
