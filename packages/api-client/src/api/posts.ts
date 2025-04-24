import type { PostsParams } from '@marchen/lib'

import { Delete, Get, Patch, Post } from '../fetch'
import type { DataWrapper } from '../interfaces/pagination.interface'
import type {
  PostCreateRequestType,
  PostPaginationResponseType,
  PostResponseType,
  PostsArchiveResponseType,
} from '../interfaces/post.interface'

export const posts = {
  get(params?: PostsParams) {
    return Get<PostPaginationResponseType>(`/posts`, params)
  },
  getPostBySlug(params: { category: string; slug: string }) {
    return Get<PostResponseType>(`/posts/${params.category}/${params.slug}`)
  },
  getPostById(id: string) {
    return Get<PostResponseType>(`/posts/${id}`)
  },
  getArchives() {
    return Get<PostsArchiveResponseType>(`/posts/archives`)
  },
  getAll() {
    return Get<DataWrapper<PostResponseType[]>>(`/posts/all`)
  },
  delete(ids: string | string[]) {
    if (Array.isArray(ids)) {
      return Delete(`/posts`, { body: { ids } })
    }
    return Delete(`/posts/${ids}`)
  },
  deleteMultiplePosts(ids: string[]) {
    return Delete(`/posts`, { body: ids })
  },
  post(params: PostCreateRequestType) {
    return Post('/posts', params)
  },
  patch(id: string, params: PostCreateRequestType) {
    return Patch(`/posts/${id}`, params)
  },
}
