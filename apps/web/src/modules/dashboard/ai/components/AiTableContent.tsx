'use client'

import { DataTable } from '../../posts/components/shared/DataTable'
import { useAiTable } from '../hooks/use-ai-table'
import { aiColumnsData } from './AiTableColumns'

export const AiTableContent = () => {
  const { table } = useAiTable()
  return (
    <DataTable
      highlightRow={table.getRowModel().rows.find((row) => row.original.active)}
      table={table}
      columnsData={aiColumnsData}
    />
  )
}
