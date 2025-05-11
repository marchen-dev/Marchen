import { aggregate } from './api/aggregate'
import { ai } from './api/ai'
import { category } from './api/category'
import { friends } from './api/friends'
import { pages } from './api/pages'
import { posts } from './api/posts'
import { site } from './api/site'
import { user } from './api/user'

export const apiClient = {
  aggregate,
  user,
  posts,
  category,
  site,
  ai,
  friends,
  pages,
}

export * from './fetch'
