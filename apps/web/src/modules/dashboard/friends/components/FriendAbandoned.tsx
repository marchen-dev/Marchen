import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { FriendTableProvider } from '../providers/FriendTableProvider'
import { friendTableQuery } from '../queries/category-table-query'
import { FriendTable } from './FriendTable'

const Type = 'ABANDONED'

export default async function FriendAbandoned() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(friendTableQuery(Type))
  const dehydrateState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydrateState}>
      <FriendTableProvider type={Type}>
        <FriendTable />
      </FriendTableProvider>
    </HydrationBoundary>
  )
}
