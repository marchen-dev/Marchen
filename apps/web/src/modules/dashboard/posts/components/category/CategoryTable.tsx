'use client'

import { useCategoryViewTable } from '../../hooks/use-category'
import { DataTable } from '../shared/DataTable'
import { categoryColumnsData } from './CategoryTableColumns'

export const CategoryTableContent = () => {
  const { table } = useCategoryViewTable()
  return <DataTable table={table} columnsData={categoryColumnsData} />
}
