'use client'
import { Button } from '@base/components/ui/Button'
import { HomeCard } from '@base/components/ui/Card'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HomePostCategories = () => {
  const { category: categories } = useAggregationData()
  return (
    <HomeCard className="col-span-2 lg:col-span-3 xl:col-span-4">
      <p>文章分类</p>
      <ul className="mt-4 flex flex-wrap gap-6">
        {categories.map((category) => (
          <li key={category.id} className="text-sm text-gray-500">
            <Button
              variant="secondary"
              className="h-10 px-6  text-zinc-600 dark:text-zinc-400"
            >
              {category.name}
            </Button>
          </li>
        ))}
      </ul>
    </HomeCard>
  )
}
