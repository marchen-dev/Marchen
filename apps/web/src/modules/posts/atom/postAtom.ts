import type { CategoryResponseType } from '@marchen/api-client/interfaces/category.interface'
import { atomWithReset } from 'jotai/utils'

export interface PostAtomType {
  id: string
  title: string
  content: string
  cover?: string
  slug?: string
  read: number
  likes: number
  summary?: string
  summaryModel?: string
  tags?: string[]
  categoryId?: string
  updated: Date
  created: Date
  category?: CategoryResponseType
}

export const postAtom = atomWithReset<PostAtomType | null>(null)
