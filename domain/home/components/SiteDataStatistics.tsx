import { Card } from '@base/components/ui/Card/Card'
import { cn } from '@base/lib/helper'

export const SiteDataStatistics = () => {
  return (
    <>
      {siteDataStatisticsConfig.map((item) => (
        <Card key={item.title}>
          <div className={cn('flex flex-col items-center gap-2')}>
            <h3 className="text-lg font-medium">{item.title}</h3>
            <p className="text-2xl font-bold">{item.value}</p>
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
  },
  {
    title: '分类',
    value: 100,
    link: '/category',
  },
  {
    title: '友链',
    value: 100,
    link: '/friends',
  },
  {
    title: '评论',
    value: 100,
  },
  {
    title: '在线访客',
    value: 100,
  },
  {
    title: '点赞数',
    value: 100,
  },
  {
    title: '全站字符数',
    value: 100,
  },
]
