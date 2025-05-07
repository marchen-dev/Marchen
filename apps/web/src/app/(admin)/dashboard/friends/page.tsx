import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@marchen/components/ui'

import { AppSidebarToolbarLayout } from '~/layout/dashboard/sidebar/AppSidebarToolbar'
import { EditFriendDialog } from '~/modules/dashboard/friends/components/EditFriendDialog'
import FriendTab from '~/modules/dashboard/friends/components/FriendTab'
import { FriendToolsArea } from '~/modules/dashboard/friends/components/FriendToolsArea'

const Status = ['ACCEPTED', 'PENDING', 'ARCHIVED'] as const

export default function FriendsPage() {
  return (
    <AppSidebarToolbarLayout toolsArea={<FriendToolsArea />}>
      <Tabs defaultValue="ACCEPTED" className="w-full">
        <TabsList>
          <TabsTrigger value="ACCEPTED">已通过</TabsTrigger>
          <TabsTrigger value="PENDING">待审核</TabsTrigger>
          <TabsTrigger value="ARCHIVED">已归档</TabsTrigger>
        </TabsList>
        {Status.map((status) => (
          <TabsContent key={status} value={status}>
            <FriendTab type={status} />
          </TabsContent>
        ))}
      </Tabs>
      <EditFriendDialog />
    </AppSidebarToolbarLayout>
  )
}
