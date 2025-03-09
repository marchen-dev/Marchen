export enum Routes {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/setup',
  DASHBOARD = '/dashboard',
  DASHBOARD_POSTS = '/dashboard/posts',
  DASHBOARD_POSTS_VIEW = '/dashboard/posts/view',
  DASHBOARD_SETTINGS = '/dashboard/settings',
  DASHBOARD_SETTINGS_USER = '/dashboard/settings/user',
}

export function routerBuilder<T extends Routes>(route: T) {
  const href = route
  return href
}
