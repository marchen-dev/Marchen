import type { PaginationRequestType } from '@base/services/interfaces/pagination.interface'

export enum Routes {
  HOME = '/',
  POSTS = '/posts',
  POST = '/posts/',
  FRIENDS = '/friends',
  LOGIN = '/login',
  REGISTER = '/setup',
  DASHBOARD = '/dashboard',
  DASHBOARD_POSTS = '/dashboard/posts',
  DASHBOARD_POSTS_VIEW = '/dashboard/posts/view',
  DASHBOARD_SETTINGS = '/dashboard/settings',
  DASHBOARD_SETTINGS_USER = '/dashboard/settings/user',
}

type PostParams = {
  category: string
  slug: string
}
type PaginationParams = Partial<PaginationRequestType>

export type PostsParams = {
  orderBy?: 'desc' | 'asc'
  category?: string
} & PaginationParams

export type RouteParams<T extends Routes> = T extends Routes.POST
  ? PostParams
  : T extends Routes.POSTS
    ? PostsParams
    : object

export function routerBuilder<T extends Routes>(
  route: T,
  params?: RouteParams<typeof route>,
) {
  let href: string = route

  switch (route) {
    case Routes.POST: {
      const p = params as PostParams
      href += `${p.category}/${p.slug}`
      break
    }
    case Routes.POSTS: {
      const p = params as PostsParams
      href += `?${new URLSearchParams(p as any).toString()}`
      break
    }
  }
  return href
}
