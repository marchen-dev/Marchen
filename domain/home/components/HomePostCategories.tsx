import { Button } from '@base/components/ui/Button'
import { HomeCard } from '@base/components/ui/Card'

export const HomePostCategories = () => {
  return (
    <HomeCard className="col-span-2 lg:col-span-3 xl:col-span-4">
      <p>文章分类</p>
      <ul className="mt-4 flex flex-wrap gap-6">
        {homePostCategoriesConfig.map((category) => (
          <li key={category} className="text-sm text-gray-500">
            <Button
              variant="secondary"
              className="h-12 px-8 text-lg text-zinc-600 dark:text-zinc-400"
            >
              {category}
            </Button>
          </li>
        ))}
      </ul>
    </HomeCard>
  )
}

const homePostCategoriesConfig = [
  '前端',
  '后端',
  '设计',
  '产品',
  '工具资源',
  '阅读',
]
