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

export type RouteParams<T extends Routes> = T extends Routes.POST
  ? PostParams
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
  }
  return href
}
