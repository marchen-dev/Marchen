'use client'

import { useCategoryViewTable } from '../../hooks/use-category'
import { DataTable } from '../shared/DataTable'
import { categoryColumnsData } from './CategoryViewTableColumns'

export const CategoryTableContent = () => {
  const { table } = useCategoryViewTable()
  return <DataTable table={table} columnsData={categoryColumnsData} />
}
