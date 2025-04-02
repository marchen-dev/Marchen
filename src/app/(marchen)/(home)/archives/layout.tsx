import { getServerQueryClient } from '@base/lib/query-client.server'
import { archivesQuery } from '@domain/archives/queries/archives-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { NormalContainer } from '~/layout/container/NormalContainer'

export default async function ArchiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(archivesQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <NormalContainer title="归档" icon="icon-[mingcute--folder-open-line]">
      <HydrationBoundary state={dehydrateState}>{children}</HydrationBoundary>
    </NormalContainer>
  )
}
