import { getServerQueryClient } from '@base/lib/query-client.server'
import { postPaginationQuery } from '@domain/posts/queries/post-pagination-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '~/layout/container/NormalContainer'

export const metadata: Metadata = {
  title: '文章列表',
  description: '文章列表',
}

export default async function PostsLayout({ children }: PropsWithChildren) {
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(postPaginationQuery())
  const dehydrateState = dehydrate(queryClient)
  return (
    <NormalContainer title="文章列表">
      <HydrationBoundary state={dehydrateState}>{children}</HydrationBoundary>
    </NormalContainer>
  )
}
