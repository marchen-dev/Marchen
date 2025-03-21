import { aggregate } from './api/aggregate'
import { posts } from './api/posts'
import { user } from './api/user'

export const apiClient = {
  aggregate,
  user,
  posts,
}
