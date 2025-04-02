import { routerBuilder, Routes } from '@base/lib/route-builder'

export const HeaderNavConfig = [
  {
    href: '/',
    label: '首页',
    icon: 'icon-[mingcute--home-3-line]',
  },
  {
    href: routerBuilder(Routes.POSTS),
    label: '文章',
    icon: 'icon-[mingcute--book-6-line]',
  },
  {
    href: routerBuilder(Routes.ARCHIVE),
    label: '归档',
    icon: 'icon-[mingcute--folder-open-line]',
  },
  {
    href: '/blog',
    label: '更多',
    // icon: 'icon-[mingcute--more-3-line]',
    // icon:'icon-[mingcute--tornado-2-line]'
    icon: 'icon-[mingcute--grid-line]',
  },
]
