import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@base/components/ui/Select'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export const PostSort = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultValue = useMemo(() => {
    return searchParams.get('orderBy') ?? 'desc'
  }, []) // 只在路径改变时重新计算
  const handleSortChange = (direction: 'desc' | 'asc') => {
    router.push(
      routerBuilder(Routes.POSTS, {
        orderBy: direction,
      }),
    )
  }
  return (
    <Select defaultValue={defaultValue} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full max-w-[120px]">
        <SelectValue placeholder="排序" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desc" defaultChecked>
          最新博文
        </SelectItem>
        <SelectItem value="asc">最旧博文</SelectItem>
      </SelectContent>
    </Select>
  )
}
