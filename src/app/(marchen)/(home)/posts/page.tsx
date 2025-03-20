import { Input } from '@base/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@base/components/ui/Select'
import type { Metadata } from 'next/dist/types'

import { NormalContainer } from '~/layout/container/NormalContainer'

export const metadata: Metadata = {
  title: '文章列表',
  description: '文章列表',
}

export default function PostsPage() {
  return (
    <NormalContainer>
      <div className="flex items-center gap-2">
        <Input className="bg-white" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </NormalContainer>
  )
}
