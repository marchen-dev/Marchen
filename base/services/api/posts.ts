import { Get } from '../fetch'
import type { PaginationRequestType } from '../interfaces/pagination.interface'
import type { PostPaginationResponseType } from '../interfaces/post.interface'

export const posts = {
  get(params: PaginationRequestType) {
    return Get<PostPaginationResponseType>('/posts', params)
  },
}
