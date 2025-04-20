import type { PaginationRequestType } from '../../api-client/src/interfaces/pagination.interface'
import { mergeUrlParams } from './merge-url'

export enum Routes {
  HOME = '/',
  POSTS = '/posts',
  POST = '/posts/',
  FRIENDS = '/friends',
  ABOUT = '/about',
  ARCHIVE = '/archives',
  LOGIN = '/login',
  REGISTER = '/setup',
  DASHBOARD = '/dashboard',
  DASHBOARD_POSTS = '/dashboard/posts',
  DASHBOARD_POSTS_VIEW = '/dashboard/posts/view',
  DASHBOARD_POSTS_EDIT = '/dashboard/posts/edit',
  DASHBOARD_SETTINGS = '/dashboard/settings',
  DASHBOARD_SETTINGS_USER = '/dashboard/settings/user',
}

type PostParams = {
  category: string
  slug: string
}

type idParams = {
  id: string
}

type PaginationParams = Partial<PaginationRequestType>

export type PostsParams = {
  orderBy?: 'desc' | 'asc'
  category?: string
  search?: string
} & PaginationParams

export type RouteParams<T extends Routes> = T extends Routes.POST
  ? PostParams
  : T extends Routes.POSTS
    ? PostsParams
    : T extends Routes.DASHBOARD_POSTS_EDIT
      ? idParams
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
      const p = mergeUrlParams(params as Record<string, string>) ?? {}
      if (Object.keys(p).length > 0) {
        href += `?${new URLSearchParams(p).toString()}`
      }
      break
    }
    case Routes.DASHBOARD_POSTS_EDIT: {
      const p = params as idParams
      href += `?${new URLSearchParams({ id: p?.id }).toString()}`
      break
    }
  }
  return href
}
