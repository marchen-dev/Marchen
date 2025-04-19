import type { PostsParams } from '@marchen/lib'

import { Get } from '../fetch'
import type {
  PostPaginationResponseType,
  PostResponseType,
  PostsArchiveResponseType,
} from '../interfaces/post.interface'

export const posts = {
  get(params: PostsParams) {
    return Get<PostPaginationResponseType>(`/posts`, params)
  },
  getDetail(params: { category: string; slug: string }) {
    return Get<PostResponseType>(`/posts/${params.category}/${params.slug}`)
  },
  archives() {
    return Get<PostsArchiveResponseType>(`/posts/archives`)
  },
}
