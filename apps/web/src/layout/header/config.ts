import { Routes } from '@marchen/lib'

export const HeaderNavMoreConfig = {
  label: '更多',
  icon: 'icon-[mingcute--down-line]',
  href: null,
  items: [
    {
      href: Routes.FRIENDS,
      label: '友链',
      icon: 'icon-[mingcute--contacts-4-line]',
    },
    {
      href: Routes.ABOUT,
      label: '关于',
      icon: 'icon-[mingcute--bulb-line]',
    },
  ],
}

export const HeaderNavConfig = [
  {
    href: '/',
    label: '首页',
    icon: 'icon-[mingcute--home-3-line]',
  },
  {
    href: Routes.POSTS,
    label: '文章',
    icon: 'icon-[mingcute--book-6-line]',
  },
  {
    href: Routes.ARCHIVE,
    label: '归档',
    icon: 'icon-[mingcute--folder-open-line]',
  },
  HeaderNavMoreConfig,
]
