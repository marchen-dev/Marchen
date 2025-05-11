import { MarchenCard } from '@marchen/components/ui'
import { getServerQueryClient } from '@marchen/lib'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { InjectPageData } from '~/modules/pages/components/InjectPostData'
import { pageDetailQuery } from '~/modules/pages/components/post-detail-query'
import { PostRightAside } from '~/modules/posts/components/detail/aside/PostRightAside'
import { TocTree } from '~/modules/posts/components/detail/aside/TocTree'
import { PostContent } from '~/modules/posts/components/detail/postContent'
import { PostHeader } from '~/modules/posts/components/detail/PostHeader'
import { PostTransitionAnimate } from '~/modules/posts/components/detail/PostTransitionAnimate'
import { MarkdownElementProvider } from '~/modules/posts/providers/MarkdownElementProvider'

interface PostLayoutProps {
  params: Promise<{ slug: string }>
}
export const generateMetadata = async ({ params }: PostLayoutProps) => {
  const { slug } = await params
  const queryClient = getServerQueryClient()
  const post = await queryClient.fetchQuery(pageDetailQuery({ slug }))
  return {
    title: post.title,
    description: post.title,
  }
}

export default async function PostPage(props: PostLayoutProps) {
  const { params } = props
  const { slug } = await params
  const queryClient = getServerQueryClient()
  await queryClient.prefetchQuery(pageDetailQuery({ slug }))
  const dehydrateState = dehydrate(queryClient)
  return (
    <HydrationBoundary state={dehydrateState}>
      <InjectPageData />
      <PostTransitionAnimate>
        <MarkdownElementProvider>
          <div className="grid grid-cols-1 xl:grid-cols-[200px_850px_200px]">
            <main className="max-w-reader xl:col-start-2">
              <MarchenCard className="p-4 md:p-8">
                <PostHeader />
                <PostContent />
              </MarchenCard>
            </main>

            <PostRightAside>
              <TocTree />
            </PostRightAside>
          </div>
        </MarkdownElementProvider>
      </PostTransitionAnimate>
    </HydrationBoundary>
  )
}
