import { apiClient } from '@marchen/api-client'
import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { EditorToolsArea } from '~/modules/dashboard/posts/components/edit/EditorToolsArea'
import { MarkdownEditorContent } from '~/modules/dashboard/posts/components/edit/MarkdownEditorContent'
import { MarkdownEditorHeader } from '~/modules/dashboard/posts/components/edit/MarkdownEditorHeader'
import { PostEditorFormProvider } from '~/modules/dashboard/posts/providers/PostEditorFormProvider'

export default async function EditPostPage(params: {
  searchParams: Promise<{ id: string }>
}) {
  const { id } = await params.searchParams
  let post: PostResponseType | undefined
  if (id) {
    post = await apiClient.posts.getPostById(id)
  }

  return (
    <PostEditorFormProvider postData={post}>
      <AppSidebarToolbarLayout toolsArea={<EditorToolsArea />}>
        <MarkdownEditorHeader />
        <MarkdownEditorContent />
      </AppSidebarToolbarLayout>
    </PostEditorFormProvider>
  )
}
