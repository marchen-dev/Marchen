import { aggregate } from './api/aggregate'
import { category } from './api/category'
import { posts } from './api/posts'
import { site } from './api/site'
import { user } from './api/user'

export const apiClient = {
  aggregate,
  user,
  posts,
  category,
  site,
}

export * from './fetch'
