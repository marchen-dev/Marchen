import type { PostsParams } from '@base/lib/route-builder'

import { Get } from '../fetch'
import type { PostPaginationResponseType } from '../interfaces/post.interface'

export const posts = {
  get(params: PostsParams) {
    return Get<PostPaginationResponseType>('/posts', params)
  },
}
