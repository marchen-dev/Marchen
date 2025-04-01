import { Input } from '@base/components/ui/Input'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { debounce } from 'lodash-es'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export const PostsSearch = () => {
  const router = useRouter()
  const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    router.push(routerBuilder(Routes.POSTS, { search: value ?? '' }))
  }, 200)
  const searchParams = useSearchParams()
  const defaultValue = useMemo(() => {
    return searchParams.get('search')
  }, []) // 只在路径改变时重新计算
  return (
    <Input
      placeholder="搜索文章"
      onChange={handleSearch}
      defaultValue={defaultValue ?? ''}
    />
  )
}
