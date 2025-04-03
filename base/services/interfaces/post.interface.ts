import type { CategoryResponseType } from './category.interface'
import type { DataWrapper } from './pagination.interface'

interface PostResponseType {
  id: string
  title: string
  content: string
  cover: string
  slug: string
  read: number
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

interface PostPaginationResponseType
  extends DataWrapper<PostCategoryResponseType> {
  take: number
  nextId?: string
}

interface PostCategoryResponseType {
  posts: PostResponseType[]
  categories: CategoryResponseType[]
}

type PostsArchiveResponseType = DataWrapper<
  Array<{
    year: number
    posts: PostArchiveItemType[]
  }>
>

interface PostArchiveItemType {
  id: string
  title: string
  created: string
  slug: string
  category: {
    name: string
  }
}

export type {
  PostArchiveItemType,
  PostCategoryResponseType,
  PostCreateRequestType,
  PostPaginationResponseType,
  PostResponseType,
  PostsArchiveResponseType,
  PostUpdateRequestType,
}
