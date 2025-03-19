'use client'

import { UserAvatar } from '@base/components/ui/Avatar'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HomeRightColumn = () => {
  const { user } = useAggregationData()
  return (
    <div className="flex flex-col items-end gap-5">
      <UserAvatar src={user.avatar} alt={user.name} width={300} height={300} />
    </div>
  )
}
