import type { CategoryResponseType } from './category.interface'

interface PostResponseType {
  id: string
  title: string
  content: string
  cover: string
  slug: string
  tags: string[]
  categoryId: string
  updated: Date
  created: Date
  category: CategoryResponseType
}

interface PostCreateRequestType {
  title: string
  content: string
  cover: string
  slug: string
  tags: string[]
  categoryId: string
}

interface PostUpdateRequestType {
  title?: string
  content?: string
  cover?: string
  slug?: string
  tags?: string[]
  categoryId?: string
}

export type { PostCreateRequestType, PostResponseType, PostUpdateRequestType }
