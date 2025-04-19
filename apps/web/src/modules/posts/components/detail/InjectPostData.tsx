'use client'

import { jotaiStore } from '@marchen/atom'
import { useBeforeMounted } from '@marchen/hooks'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

import { postAtom } from '../../atom/postAtom'
import { postDetailQuery } from '../../queries/post-detail-query'

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
