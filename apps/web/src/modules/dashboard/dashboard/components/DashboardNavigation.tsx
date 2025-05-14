'use client'

import { Button, MarchenCard } from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import Link from 'next/link'
import { useMemo } from 'react'

import { sidebarData } from '~/layout/dashboard/sidebar/config'

import { useDashboard } from '../hooks/use-dashboard'

export const DashboardNavigation = () => {
  const navigationItems = useNavigationData()
  return (
    <section className="mt-5">
      <h2 className="font-medium">快捷导航</h2>
      <div className="mt-2 grid  grid-cols-[repeat(auto-fill,minmax(240px,1fr))]  gap-4">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.title}
            title={item.title}
            icon={item.icon}
            count={item.count}
            action={item.action}
          />
        ))}
      </div>
    </section>
  )
}

interface NavigationItemProps {
  title: string
  icon: string
  count: number
  action: Array<{
    label: string
    url: string
  }>
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  title,
  icon,
  count,
  action,
}) => {
  return (
    <MarchenCard className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 ">
          <span className="">{title}</span>
          <span className="text-xl font-semibold ">{count}</span>
        </div>
        <i className={cn(icon, 'size-6')} />
      </div>

      <div className="mt-3 space-x-3">
        {action.map((item, index) => (
          <Button
            key={item.label}
            variant={index % 2 === 0 ? 'default' : 'outline'}
            asChild
          >
            <Link href={item.url}>{item.label}</Link>
          </Button>
        ))}
      </div>
    </MarchenCard>
  )
}

const useNavigationData = () => {
  const dashboardData = useDashboard()

  return useMemo(() => {
    // 获取所有带有 countKey 和 navigationActions 的项目
    const navigationItems = sidebarData.content
      .flatMap((section) => section.items)
      .filter((item) => item.countKey && item.navigationActions)
      .map((item) => {
        // 构建导航操作
        const actions = item.navigationActions!.map((action) => {
          let url = ''
          if (action.url) {
            url = action.url
          } else if (action.urlIndex !== undefined) {
            if (action.urlIndex === -1 && item.url) {
              url = item.url
            } else if (
              item.items &&
              action.urlIndex >= 0 &&
              action.urlIndex < item.items.length
            ) {
              url = item.items[action.urlIndex].url || ''
            }
          }

          return {
            label: action.label,
            url,
          }
        })

        return {
          title: item.title,
          icon: item.icon || '',
          count: dashboardData.count[item.countKey!],
          action: actions,
        }
      })

    return navigationItems
  }, [dashboardData])
}
