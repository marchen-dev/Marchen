'use client'

import { AvatarNext } from '@base/components/ui/Avatar'
import { HomeCard } from '@base/components/ui/Card/HomeCard'
import { cn } from '@base/lib/helper'
import { parseSocialIcon } from '@base/lib/social-icon'
import { m } from 'framer-motion'
import { memo, useMemo } from 'react'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HomeMasterInfo = memo(() => {
  const { user } = useAggregationData()
  const socialMedias = useMemo(
    () => parseSocialIcon(user.social),
    [user.social],
  )
  return (
    <HomeCard className="col-span-2 min-h-64 overflow-hidden lg:col-span-1">
      <div className="flex flex-col items-center gap-2">
        <AvatarNext src={user.avatar} alt="avatar" height={100} width={100} />
        <h2 className="text-xl font-medium">{user.nickname}</h2>
        <p className="text-sm text-secondary">{user.introduce}</p>
        <ul className="mt-2 flex gap-4 ">
          {socialMedias.map(({ color, icon, link, name }) => (
            <li key={name}>
              <m.a
                href={link}
                className={cn(
                  'flex size-9 items-center justify-center rounded-full  text-base-100',
                )}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                target="_blank"
                rel="noreferrer"
              >
                <i className={cn(icon, 'text-[1.4rem] text-white')} />
              </m.a>
            </li>
          ))}
        </ul>
      </div>
    </HomeCard>
  )
})
