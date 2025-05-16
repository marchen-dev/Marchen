import { Routes } from '@marchen/lib'

// 基本项目类型
export interface MenuItem {
  id: string // 唯一标识符
  title: string // 显示的标题
  url?: string // 链接地址
  icon?: string // 图标类名
  items?: MenuItem[] // 子菜单项
  countKey?:
    | 'post'
    | 'category'
    | 'friend'
    | 'page'
    | 'character'
    | 'read'
    | 'like'
    | 'ai' // 对应的计数键名
  pin?: boolean // 是否在快捷导航中显示
  isHidden?: boolean // 是否在侧边栏中隐藏
}

// 分组类型
export interface MenuGroup {
  id: string // 唯一标识符
  title: string // 分组标题
  pin?: boolean // 是否将该组的菜单项显示在导航中
  items: MenuItem[] // 分组中的菜单项
}

// 侧边栏配置
export interface SidebarConfig {
  groups: MenuGroup[]
}

// 导航配置类型
export interface NavigationAction {
  label: string
  targetId?: string // 目标菜单项ID
  targetIndex?: number // 目标菜单项的子项索引，-1表示菜单项本身
  url?: string // 直接指定URL
}

export interface NavigationConfig {
  items: MenuItem[]
}

// 所有配置合并到一个对象
export interface AppConfig {
  sidebar: SidebarConfig
  navigation: {
    items: Array<{
      menuItemId: string // 引用菜单项ID
      actions: NavigationAction[]
    }>
  }
}

// 定义菜单项
const menuItems: MenuItem[] = [
  {
    id: 'overview',
    title: '概览',
    url: Routes.DASHBOARD,
    icon: 'icon-[mingcute--home-6-line]',
  },
  {
    id: 'post',
    title: '博文',
    icon: 'icon-[mingcute--book-6-line]',
    pin: true,
    countKey: 'post',
    items: [
      {
        id: 'post-manage',
        title: '管理',
        url: Routes.DASHBOARD_POSTS_VIEW,
      },
      {
        id: 'post-write',
        title: '编写',
        url: Routes.DASHBOARD_POSTS_EDIT,
      },
      {
        id: 'post-categories',
        title: '分类',
        url: Routes.DASHBOARD_POSTS_CATEGORIES,
      },
    ],
  },
  {
    id: 'page',
    title: '页面',
    icon: 'icon-[mingcute--document-3-line]',
    pin: true,
    countKey: 'page',
    items: [
      {
        id: 'page-manage',
        title: '管理',
        url: Routes.DASHBOARD_PAGES_VIEW,
      },
      {
        id: 'page-edit',
        title: '编辑',
        url: Routes.DASHBOARD_PAGES_EDIT,
      },
    ],
  },
  {
    id: 'friend',
    title: '朋友',
    url: Routes.DASHBOARD_FRIENDS,
    icon: 'icon-[mingcute--contacts-4-line]',
    pin: true,
    countKey: 'friend',
  },
  {
    id: 'setting',
    title: '设定',
    url: Routes.DASHBOARD_SETTINGS,
    icon: 'icon-[mingcute--settings-6-line]',
    items: [
      {
        id: 'setting-user',
        title: '用户',
        url: Routes.DASHBOARD_SETTINGS_USER,
      },
      {
        id: 'setting-website',
        title: '网页',
        url: Routes.DASHBOARD_SETTINGS_WEBSITE,
      },
    ],
  },
  {
    id: 'ai',
    title: 'AI',
    countKey: 'ai',
    pin: true,
    url: Routes.DASHBOARD_AI,

    icon: 'icon-[mingcute--ai-line]',
  },
  {
    id: 'category',
    title: '分类',
    icon: 'icon-[mingcute--folder-2-line]',
    countKey: 'category',
    pin: true,
    isHidden: true, // 在侧边栏中隐藏，但在导航中显示
  },
  {
    id: 'character',
    title: '博文字符数',
    icon: 'icon-[mingcute--book-5-line]',
    pin: true,
    countKey: 'character',
    isHidden: true,
  },
  {
    id: 'read',
    title: '阅读总量',
    icon: 'icon-[mingcute--eyeglass-line]',
    pin: true,
    countKey: 'read',
    isHidden: true,
  },
  {
    id: 'like',
    title: '点赞总量',
    icon: 'icon-[mingcute--heart-line]',
    pin: true,
    countKey: 'like',
    isHidden: true,
  },
]

// 定义配置
export const appConfig: AppConfig = {
  sidebar: {
    groups: [
      {
        id: 'view',
        title: '视图',
        items: ['overview'].map(
          (id) => menuItems.find((item) => item.id === id)!,
        ),
      },
      {
        id: 'manage',
        title: '管理',
        pin: true,
        items: ['post', 'page', 'friend', 'setting'].map(
          (id) => menuItems.find((item) => item.id === id)!,
        ),
      },
      {
        id: 'advanced',
        title: '高级',
        pin: true,
        items: ['ai'].map((id) => menuItems.find((item) => item.id === id)!),
      },
    ],
  },
  navigation: {
    items: [
      {
        menuItemId: 'post',
        actions: [
          { label: '管理', targetIndex: 0 },
          { label: '编写', targetIndex: 1 },
        ],
      },
      {
        menuItemId: 'page',
        actions: [
          { label: '管理', targetIndex: 0 },
          { label: '编辑', targetIndex: 1 },
        ],
      },
      {
        menuItemId: 'friend',
        actions: [{ label: '管理', targetIndex: -1 }],
      },
      {
        menuItemId: 'category',
        actions: [{ label: '管理', url: Routes.DASHBOARD_POSTS_CATEGORIES }],
      },
      {
        menuItemId: 'ai',
        actions: [{ label: '管理', url: Routes.DASHBOARD_AI }],
      },
      {
        menuItemId: 'character',
        actions: [],
      },
      {
        menuItemId: 'read',
        actions: [],
      },
      {
        menuItemId: 'like',
        actions: [],
      },
    ],
  },
}

export function getAllMenuItems(config: AppConfig): MenuItem[] {
  const result: MenuItem[] = []

  function collectItems(items: MenuItem[]) {
    for (const item of items) {
      result.push(item)
      if (item.items) {
        collectItems(item.items)
      }
    }
  }

  for (const group of config.sidebar.groups) {
    collectItems(group.items)
  }

  for (const item of menuItems) {
    if (item.isHidden && !result.includes(item)) {
      result.push(item)
    }
  }

  return result
}

export function getNavigationItems() {
  return appConfig.navigation.items.map((navItem) => {
    const menuItem = menuItems.find((item) => item.id === navItem.menuItemId)!

    const actions = navItem.actions.map((action) => {
      let url = ''
      if (action.url) {
        url = action.url
      } else if (action.targetIndex !== undefined) {
        if (action.targetIndex === -1 && menuItem.url) {
          url = menuItem.url
        } else if (
          menuItem.items &&
          action.targetIndex >= 0 &&
          action.targetIndex < menuItem.items.length
        ) {
          url = menuItem.items[action.targetIndex].url || ''
        }
      } else if (action.targetId) {
        const targetItem = getAllMenuItems(appConfig).find(
          (item) => item.id === action.targetId,
        )
        if (targetItem) {
          url = targetItem.url || ''
        }
      }

      return {
        label: action.label,
        url,
      }
    })

    return {
      id: menuItem.id,
      title: menuItem.title,
      icon: menuItem.icon || '',
      countKey: menuItem.countKey,
      action: actions,
    }
  })
}

export const sidebarData = {
  content: appConfig.sidebar.groups.map((group) => ({
    title: group.title,
    pin: group.pin,
    items: group.items
      .filter((item) => !item.isHidden)
      .map((item) => ({
        title: item.title,
        url: item.url,
        icon: item.icon,
        pin: item.pin,
        countKey: item.countKey,
        items: item.items?.map((subItem) => ({
          title: subItem.title,
          url: subItem.url,
        })),
      })),
  })),
} as {
  content: SidebarContentType[]
}

export interface SidebarItemType {
  title: string
  url?: string
  items?: SidebarItemType[]
  icon?: string
  isActive?: boolean
  pin?: boolean
  countKey?:
    | 'post'
    | 'category'
    | 'friend'
    | 'page'
    | 'character'
    | 'read'
    | 'like'
    | 'ai'
}

export interface SidebarContentType {
  title: string
  items: SidebarItemType[]
  pin?: boolean
}

export interface SidebarDataType {
  content: SidebarContentType[]
}
