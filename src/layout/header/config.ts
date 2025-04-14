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
    label: '更多',
    icon: 'icon-[mingcute--down-line]',
    items: [
      {
        href: routerBuilder(Routes.FRIENDS),
        label: '友链',
        icon: 'icon-[mingcute--contacts-4-line]',
      },
      {
        href: routerBuilder(Routes.ABOUT),
        label: '关于',
        icon: 'icon-[mingcute--bulb-line]',
      },
    ],
  },
]
