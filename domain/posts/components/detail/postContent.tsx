'use client'

import { Markdown } from '@base/components/ui/Markdown'
import { usePostSelector } from '@domain/posts/atom/selectors/post-selector'

export const PostContent = () => {
  const post = usePostSelector((state) => state?.content)

  if (!post) {
    return
  }
  return (
    <div className="mt-3">
      <Markdown content={post} as="article" />
    </div>
  )
}
