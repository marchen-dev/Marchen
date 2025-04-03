import { getServerQueryClient } from '@base/lib/query-client.server'
import ArchivesContent from '@domain/archives/components/ArchivesContent'
import { archivesQuery } from '@domain/archives/queries/archives-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'

import { NormalContainer } from '~/layout/container/NormalContainer'

export const metadata: Metadata = {
  title: '归档',
  description: '归档',
}

export default async function ArchiveLayout() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(archivesQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <NormalContainer title="归档" icon="icon-[mingcute--folder-open-line]">
      <HydrationBoundary state={dehydrateState}>
        <ArchivesContent />
      </HydrationBoundary>
    </NormalContainer>
  )
}
