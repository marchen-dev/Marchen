'use client'

import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { jotaiStore } from '@marchen/atom'
import { useBeforeMounted } from '@marchen/hooks'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { postAtom } from '~/modules/posts/atom/postAtom'

import { pageDetailQuery } from './post-detail-query'

export const InjectPageData = () => {
  const params = useParams<{ slug: string }>()
  const { slug } = params
  const { data } = useQuery(pageDetailQuery({ slug }))
  useBeforeMounted(() => {
    if (data) {
      jotaiStore.set(postAtom, data as PostResponseType)
    }
  })

  useEffect(() => {
    if (data) {
      jotaiStore.set(postAtom, data as PostResponseType)
    }
  }, [data])
  return null
}
