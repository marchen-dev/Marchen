import { Routes } from '@marchen/lib'

export const HeaderNavMoreConfig = {
  title: '更多',
  icon: 'icon-[mingcute--down-line]',
  slug: null,
  items: [
    {
      slug: Routes.FRIENDS,
      title: '友链',
      icon: 'icon-[mingcute--contacts-4-line]',
    },
  ],
}

export const HeaderNavConfig = [
  {
    slug: Routes.HOME,
    title: '首页',
    icon: 'icon-[mingcute--home-3-line]',
  },
  {
    slug: Routes.POSTS,
    title: '文章',
    icon: 'icon-[mingcute--book-6-line]',
  },
  {
    slug: Routes.ARCHIVE,
    title: '归档',
    icon: 'icon-[mingcute--folder-open-line]',
  },
]
