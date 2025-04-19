'use client'

import { createFadeInOutTransition, MarchenCard } from '@marchen/components/ui'
import { m } from 'framer-motion'
import Image from 'next/image'

import { NarrowContainer } from '~/layout/container/NarrowContainer'
import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export default function FriendsPage() {
  const friends = useAggregationDataSelector((state) => state?.friend)

  return (
    <NarrowContainer title="朋友们" icon="icon-[mingcute--group-2-line]">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {friends?.map((friend) => (
          <m.li
            key={friend.id}
            {...createFadeInOutTransition()}
            whileHover={{
              scale: 1.03,
              y: -4,
              transition: {
                type: 'spring',
                stiffness: 300,
                damping: 15,
              },
            }}
            whileTap={{ scale: 0.98 }}
          >
            <MarchenCard
              as="a"
              className="flex h-full flex-col items-center gap-1 px-1 py-4"
              href={friend.url}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                src={friend.avatar}
                alt={friend.name}
                width={65}
                height={65}
                className="rounded-lg border border-base-300 "
              />
              <p className="mt-2 line-clamp-1 text-center font-semibold">
                {friend.name}
              </p>
              <p className="line-clamp-2 text-center text-sm">
                {friend.introduce}
              </p>
            </MarchenCard>
          </m.li>
        ))}
      </ul>
    </NarrowContainer>
  )
}
