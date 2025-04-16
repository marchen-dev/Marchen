import type { CategoryResponseType } from './category.interface'
import type { FriendResponseType } from './friend.interface'
import type { PostResponseType } from './post.interface'
import type { SiteResponseType } from './site.interface'
import type { UserGetResponseType } from './user.interface'

interface GetAggregateResponseType {
  user: UserGetResponseType
  category: CategoryResponseType[]
  post: PostResponseType[]
  friend: FriendResponseType[]
  site: SiteResponseType
}

export type { GetAggregateResponseType }
