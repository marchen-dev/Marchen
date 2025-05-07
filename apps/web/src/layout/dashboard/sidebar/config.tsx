import { Routes } from '@marchen/lib'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  LayoutTemplate,
  Settings2,
  SquareTerminal,
  Users,
} from 'lucide-react'

export const sidebarData = {
  content: [
    {
      title: '视图',
      items: [
        {
          title: '概览',
          url: Routes.DASHBOARD,
          icon: SquareTerminal,
        },
      ],
    },
    {
      title: '管理',
      items: [
        {
          title: '博文',
          icon: BookOpen,
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
          icon: LayoutTemplate,
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
          icon: Users,
        },
        {
          title: '设定',
          url: Routes.DASHBOARD_SETTINGS,
          icon: Settings2,
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
      items: [
        {
          title: 'AI',
          url: Routes.DASHBOARD_AI,
          icon: () => <i className="icon-[mingcute--ai-line] size-[16px]" />,
        },
      ],
    },
  ],
} as SidebarDataType

export interface SidebarItemType {
  title: string // 菜单项的标题
  url?: string // 菜单项的链接地址
  items?: SidebarItemType[] // 如果该菜单项有子条目，则是子菜单数组
  icon?: LucideIcon // 图标组件（从 lucide-react 中导入）
  isActive?: boolean // 是否为激活项，可选
}

export interface SidebarContentType {
  title: string // 顶级内容的标题
  items: SidebarItemType[] // 顶级内容中的菜单项数组
}

export interface SidebarDataType {
  content: SidebarContentType[] // 包含一个或多个菜单内容块
}
