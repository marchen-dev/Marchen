'use client'

import { DataTable } from '../../../posts/components/shared/DataTable'
import { usePagesViewTable } from '../../hooks/use-pages-view-table'
import { pageColumnsData } from './PagesTableColumns'

export const PagesTableContent = () => {
  const { table } = usePagesViewTable()
  return <DataTable table={table} columnsData={pageColumnsData} />
}
