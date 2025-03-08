export enum Routes {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/setup',
  DASHBOARD = '/dashboard',
  DASHBOARD_POSTS = '/dashboard/posts/view',
  DASHBOARD_SETTINGS = '/dashboard/settings',
}

export function routerBuilder<T extends Routes>(route: T) {
  const href = route
  return href
}
