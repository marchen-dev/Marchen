import type { FriendStatus } from '@marchen/api-client/interfaces/friend.interface'
import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { FriendTableProvider } from '../providers/FriendTableProvider'
import { friendTableQuery } from '../queries/category-table-query'
import { FriendTable } from './FriendTable'

export default async function FriendTab({ type }: { type: FriendStatus }) {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(friendTableQuery(type))
  const dehydrateState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydrateState}>
      <FriendTableProvider type={type}>
        <FriendTable />
      </FriendTableProvider>
    </HydrationBoundary>
  )
}
