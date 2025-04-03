'use client'

import { usePostSelector } from '@domain/posts/atom/selectors/post-selector'
import Markdown from 'react-markdown'

export const PostContent = () => {
  const post = usePostSelector((state) => state?.content)
  return (
    <section className="mt-7">
      <Markdown>{post}</Markdown>
    </section>
  )
}
