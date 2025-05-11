'use client'

import { usePagesViewTable } from '../../hooks/use-pages-view-table'
import { PagesTablePagination } from './PagesTablePagination'

export const PagesTableFooter = () => {
  const { table } = usePagesViewTable()
  return (
    <div>
      <PagesTablePagination table={table} />
    </div>
  )
}
