import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@base/components/ui/Select'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { useRouter } from 'next/navigation'

export const PostSort = () => {
  const router = useRouter()
  const handleSortChange = (direction: 'desc' | 'asc') => {
    router.push(
      routerBuilder(Routes.POSTS, {
        direction,
      }),
    )
  }
  return (
    <Select defaultValue="dsc" onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="排序" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dsc" defaultChecked>
          最新博文
        </SelectItem>
        <SelectItem value="asc">最旧博文</SelectItem>
      </SelectContent>
    </Select>
  )
}
