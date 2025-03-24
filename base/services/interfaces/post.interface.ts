import type { CategoryResponseType } from './category.interface'
import type { DataWrapper } from './pagination.interface'

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

interface PostPaginationResponseType extends DataWrapper<PostResponseType[]> {
  total: number
  page: number
  pageSize: number
  totalPages: number
  orderBy: 'desc' | 'asc'
  category: string
}

export type {
  PostCreateRequestType,
  PostPaginationResponseType,
  PostResponseType,
  PostUpdateRequestType,
}
