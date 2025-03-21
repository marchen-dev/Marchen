import type { PostPaginationResponseType } from '@base/services/interfaces/post.interface'

export interface PostPaginationStoreState extends PostPaginationResponseType {}

export const initialPostPaginationStoreState: PostPaginationStoreState = {
  data: [],
  total: 0,
  page: 1,
  pageSize: 10,
}
