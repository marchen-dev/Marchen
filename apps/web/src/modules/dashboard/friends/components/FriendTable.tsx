'use client'

import { DataTable } from '../../posts/components/shared/DataTable'
import { useFriendTable } from '../hooks/use-friend-table'
import { friendColumnsData } from './FriendTableColumns'

export const FriendTable = () => {
  const { table, type } = useFriendTable()
  return <DataTable table={table} columnsData={friendColumnsData(type)} />
}
