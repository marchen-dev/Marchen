'use client'

import { jotaiStore } from '@base/atom'
import { useBeforeMounted } from '@base/hooks/use-before-mounted'
import { postAtom } from '@domain/posts/atom/postAtom'
import { postDetailQuery } from '@domain/posts/queries/post-detail-query'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export const InjectPostData = () => {
  const params = useParams<{ category: string; slug: string }>()
  const { category, slug } = params
  const { data } = useQuery(postDetailQuery({ category, slug }))
  useBeforeMounted(() => {
    if (data) {
      jotaiStore.set(postAtom, data)
    }
  })

  useEffect(() => {
    if (data) {
      jotaiStore.set(postAtom, data)
    }
  }, [data])
  return null
}
