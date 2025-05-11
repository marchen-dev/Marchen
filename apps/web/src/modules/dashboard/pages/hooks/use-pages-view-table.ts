import type { PageResponseType } from '@marchen/api-client/interfaces/page.interface'
import type { Table } from '@tanstack/react-table'
import { createContext, use } from 'react'

export const PagesTableContext = createContext<{
  table: Table<PageResponseType>
} | null>(null)

export const usePagesViewTable = () => {
  const context = use(PagesTableContext)
  if (!context) {
    throw new Error(
      'usePagesViewTable must be used within a PagesTableProvider',
    )
  }
  return context
}
