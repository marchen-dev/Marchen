'use client'

import { Button, MarchenCard } from '@marchen/components/ui'
import { cn } from '@marchen/lib'
import Link from 'next/link'
import { useMemo } from 'react'

import { getNavigationItems } from '~/layout/dashboard/sidebar/config'

import { useDashboardData } from '../hooks/use-dashboard'

export const DashboardNavigation = () => {
  const navigationItems = useNavigationData()
  return (
    <section className="mt-5">
      <h2 className="font-medium">快捷导航</h2>
      <div className="mt-2 grid  grid-cols-[repeat(auto-fill,minmax(240px,1fr))]  gap-4">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.id || item.title}
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
  const dashboardData = useDashboardData()
  return useMemo(() => {
    const navItems = getNavigationItems()

    return navItems.map((item) => ({
      ...item,
      count: item.countKey ? dashboardData.count[item.countKey] : 0,
    }))
  }, [dashboardData])
}
