import { Input } from '@marchen/components/ui'
import { routerBuilder, Routes } from '@marchen/lib'
import { debounce } from 'lodash-es'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export const PostsSearch = () => {
  const router = useRouter()
  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value
      .split(' ')
      .filter((text) => text !== '')
      .join('+')
    router.push(routerBuilder(Routes.POSTS, { search: searchValue ?? '' }))
  }, 300)
  const searchParams = useSearchParams()
  const defaultValue = useMemo(() => {
    return searchParams.get('search')?.replaceAll('+', ' ')
  }, []) // 只在路径改变时重新计算
  return (
    <Input
      placeholder="搜索文章"
      className="bg-white dark:bg-black"
      onChange={handleSearch}
      defaultValue={defaultValue ?? ''}
    />
  )
}
