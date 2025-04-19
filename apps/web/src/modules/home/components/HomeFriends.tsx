'use client'

import type { FriendResponseType } from '@marchen/api-client/interfaces/friend.interface'
import { MarchenCard } from '@marchen/components/ui'
import { routerBuilder, Routes } from '@marchen/lib'
import { AnimatePresence, m } from 'framer-motion'
import Image from 'next/image'
import type { FC } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

import { HomeLayout } from './shared/HomeLayout'

export const HomeFriends = () => {
  const friends = useAggregationDataSelector((state) => state?.friend)
  return (
    <HomeLayout
      title="朋友们"
      icon="icon-[mingcute--contacts-4-line]"
      href={routerBuilder(Routes.FRIENDS)}
      className="pb-0"
    >
      <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ">
        <AnimatePresence>
          {friends?.slice(0, 10).map((friend, index) => (
            <m.li
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              viewport={{ once: true, amount: 0.2 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <HomeFriendItem key={friend.id} {...friend} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </HomeLayout>
  )
}

export const HomeFriendItem: FC<FriendResponseType> = (props) => {
  const { avatar, name, url } = props
  return (
    <MarchenCard className="p-4">
      <a
        target="_blank"
        rel="noreferrer"
        href={url}
        className="flex items-center gap-4"
      >
        <Image
          className="rounded-lg"
          src={avatar}
          height={50}
          width={50}
          alt="avatar"
        />
        <p className="line-clamp-2 text-[1.05rem] font-semibold">{name}</p>
      </a>
    </MarchenCard>
  )
}
