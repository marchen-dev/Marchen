import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@base/components/ui/Select'

export const PostSort = () => {
  return (
    <Select defaultValue="dsc">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="排序" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dsc" defaultChecked>
          最新博文
        </SelectItem>
        <SelectItem value="asc">升序</SelectItem>
      </SelectContent>
    </Select>
  )
}
