import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'

import { NarrowContainer } from '~/layout/container/NarrowContainer'
import ArchivesContent from '~/modules/archives/components/ArchivesContent'
import { archivesQuery } from '~/modules/archives/queries/archives-query'

export const metadata: Metadata = {
  title: '归档',
  description: '归档',
}

export default async function ArchiveLayout() {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(archivesQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <NarrowContainer title="归档" icon="icon-[mingcute--folder-open-line]">
      <HydrationBoundary state={dehydrateState}>
        <ArchivesContent />
      </HydrationBoundary>
    </NarrowContainer>
  )
}
