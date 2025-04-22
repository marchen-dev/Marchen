'use client'

import { MarkdownEditor } from '@marchen/components/ui'

export default function EditPostPage() {
  return (
    <div className="size-full">
      <MarkdownEditor value={''} />
    </div>
  )
}
