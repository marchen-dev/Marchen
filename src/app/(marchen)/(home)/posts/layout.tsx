import { REQUEST_QUERY } from '@base/constants/request'
import { getServerQueryClient } from '@base/lib/query-client.server'
import { postPaginationQuery } from '@domain/posts/queries/post-pagination-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import type { PropsWithChildren } from 'react'

import { NormalContainer } from '~/layout/container/NormalContainer'

export const metadata: Metadata = {
  title: '文章列表',
  description: '文章列表',
}

export default async function PostsLayout({ children }: PropsWithChildren) {
  const header = await headers()
  const query = header.get(REQUEST_QUERY) ?? ''
  const searchParams = new URLSearchParams(query)
  const orderBy = (searchParams.get('orderBy') as 'desc' | 'asc') ?? undefined
  const category = searchParams.get('category') ?? undefined

  const queryClient = getServerQueryClient()
  await queryClient.prefetchInfiniteQuery(
    postPaginationQuery({ orderBy, category }),
  )
  const dehydrateState = dehydrate(queryClient)
  return (
    <NormalContainer title="文章列表">
      <HydrationBoundary state={dehydrateState}>{children}</HydrationBoundary>
    </NormalContainer>
  )
}
