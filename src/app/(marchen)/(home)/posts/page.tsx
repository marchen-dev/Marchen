import { REQUEST_QUERY } from '@base/constants/request'
import { getServerQueryClient } from '@base/lib/query-client.server'
import PostsContent from '@domain/posts/components/PostContent'
import { postsPaginationQuery } from '@domain/posts/queries/posts-pagination-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { NormalContainer } from '~/layout/container/NormalContainer'

export const metadata: Metadata = {
  title: '文章列表',
  description: '文章列表',
}

export default async function PostsPage() {
  const header = await headers()
  const query = header.get(REQUEST_QUERY) ?? ''
  const searchParams = new URLSearchParams(query)
  const orderBy = (searchParams.get('orderBy') as 'desc' | 'asc') ?? undefined
  const category = searchParams.get('category') ?? undefined
  const search = searchParams.get('search') ?? undefined

  const queryClient = getServerQueryClient()
  await queryClient.prefetchInfiniteQuery(
    postsPaginationQuery({ orderBy, category, search }),
  )
  const dehydrateState = dehydrate(queryClient)
  return (
    <NormalContainer title="文章列表" icon="icon-[mingcute--book-6-line]">
      <HydrationBoundary state={dehydrateState}>
        <PostsContent />
      </HydrationBoundary>
    </NormalContainer>
  )
}
