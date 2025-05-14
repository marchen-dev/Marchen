import { Routes } from '@marchen/lib'

export const sidebarData = {
  content: [
    {
      title: '视图',
      items: [
        {
          title: '概览',
          url: Routes.DASHBOARD,
          icon: 'icon-[mingcute--home-6-line]',
        },
      ],
    },
    {
      title: '管理',
      pin: true,
      items: [
        {
          title: '博文',
          icon: 'icon-[mingcute--book-6-line]',
          pin: true,
          countKey: 'post',
          navigationActions: [
            {
              label: '管理',
              urlIndex: 0,
            },
            {
              label: '编写',
              urlIndex: 1,
            },
          ],
          items: [
            {
              title: '管理',
              url: Routes.DASHBOARD_POSTS_VIEW,
            },
            {
              title: '编写',
              url: Routes.DASHBOARD_POSTS_EDIT,
            },
            {
              title: '分类',
              url: Routes.DASHBOARD_POSTS_CATEGORIES,
            },
          ],
        },
        {
          title: '页面',
          icon: 'icon-[mingcute--document-3-line]',
          pin: true,
          countKey: 'page',
          navigationActions: [
            {
              label: '管理',
              urlIndex: 0,
            },
            {
              label: '编辑',
              urlIndex: 1,
            },
          ],
          items: [
            {
              title: '管理',
              url: Routes.DASHBOARD_PAGES_VIEW,
            },
            {
              title: '编辑',
              url: Routes.DASHBOARD_PAGES_EDIT,
            },
          ],
        },
        {
          title: '朋友',
          url: Routes.DASHBOARD_FRIENDS,
          icon: 'icon-[mingcute--contacts-4-line]',
          pin: true,
          countKey: 'friend',
          navigationActions: [
            {
              label: '管理',
              urlIndex: -1,
            },
          ],
        },
        {
          title: '设定',
          url: Routes.DASHBOARD_SETTINGS,
          icon: 'icon-[mingcute--settings-6-line]',
          pin: true,
          items: [
            {
              title: '用户',
              url: Routes.DASHBOARD_SETTINGS_USER,
            },
            {
              title: '网页',
              url: Routes.DASHBOARD_SETTINGS_WEBSITE,
            },
          ],
        },
      ],
    },
    {
      title: '高级',
      pin: true,
      items: [
        {
          title: 'AI',
          url: Routes.DASHBOARD_AI,
          icon: 'icon-[mingcute--ai-line]',
        },
      ],
    },
    {
      title: '其他',
      pin: true,
      items: [
        {
          title: '分类',
          icon: 'icon-[mingcute--folder-2-line]',
          countKey: 'category',
          navigationActions: [
            {
              label: '管理',
              url: Routes.DASHBOARD_POSTS_CATEGORIES,
            },
          ],
        },
      ],
    },
  ],
} as SidebarDataType

export interface SidebarItemType {
  title: string // 菜单项的标题
  url?: string // 菜单项的链接地址
  items?: SidebarItemType[] // 如果该菜单项有子条目，则是子菜单数组
  icon?: string // 图标组件（从 lucide-react 中导入）
  isActive?: boolean // 是否为激活项，可选
  pin?: boolean
  countKey?: 'post' | 'category' | 'friend' | 'page' // 对应的计数类型
  navigationActions?: Array<{
    label: string
    urlIndex?: number // 用于指定使用 items 中的第几个 url，-1 表示使用当前项的 url
    url?: string // 可以直接指定 url
  }>
}

export interface SidebarContentType {
  title: string // 顶级内容的标题
  items: SidebarItemType[] // 顶级内容中的菜单项数组
  pin?: boolean
}

export interface SidebarDataType {
  content: SidebarContentType[] // 包含一个或多个菜单内容块
}
