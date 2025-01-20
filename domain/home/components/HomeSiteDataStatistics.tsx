import { Button } from '@base/components/ui/Button'
import { Card } from '@base/components/ui/Card/Card'
import { cn } from '@base/lib/helper'

export const HomeSiteDataStatistics = () => {
  return (
    <>
      {siteDataStatisticsConfig.map((item) => (
        <Card key={item.title}>
          <div className="flex justify-between ">
            <div>
              <p className="text-zinc-500">{item.title}</p>
              <p className="mt-3 text-2xl font-medium">{item.value}</p>
            </div>
            <div className="flex items-center">
              <i className={cn(item.icon, 'text-3xl text-secondary')} />
            </div>
          </div>
          <div className="ml-0.5 mt-5">
            <Button variant="secondary">查看</Button>
          </div>
        </Card>
      ))}
    </>
  )
}

const siteDataStatisticsConfig = [
  {
    title: '文章',
    value: 100,
    link: '/archive',
    icon: 'icon-[mingcute--book-6-line]',
  },
  {
    title: '页面',
    value: 100,
    icon: 'icon-[mingcute--align-bottom-line]',
  },
  {
    title: '分类',
    value: 15,
    link: '/category',
    icon: 'icon-[mingcute--book-5-line]',
  },
  {
    title: '友链',
    value: 12,
    link: '/friends',
    icon: 'icon-[mingcute--book-4-line]',
  },
  {
    title: '评论',
    value: 23,
    icon: 'icon-[mingcute--book-3-line]',
  },
  {
    title: '在线访客',
    value: 3,
    icon: 'icon-[mingcute--book-2-line]',
  },
  {
    title: '点赞数',
    value: 521,
    icon: 'icon-[mingcute--book-line]',
  },
  {
    title: '全站字符数',
    value: 98215,
    icon: 'icon-[mingcute--album-2-line]',
  },
]
