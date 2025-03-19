'use client'

import { Button } from '@base/components/ui/Button'
import { cn } from '@base/lib/helper'
import { parseSocialIcon } from '@base/lib/social-icon'
import { m } from 'framer-motion'
import { useMemo } from 'react'

import { useAggregationData } from '~/providers/root/AggregationDataProvider'

export const HomeLeftColumn = () => {
  const { user, site } = useAggregationData()
  const socialMedias = useMemo(
    () => parseSocialIcon(user.social),
    [user.social],
  )
  return (
    <div className="flex flex-col gap-5 ">
      <h3 className="text-4xl font-medium">{site.title}</h3>
      <h4 className=" text-2xl">{user.introduce}</h4>
      <ul className="mt-2 flex gap-4 ">
        {socialMedias.map(({ color, icon, link, name }) => (
          <li key={name}>
            <m.a
              href={link}
              className={cn(
                'flex size-10 items-center justify-center rounded-full text-base-100 shadow-sm transition-shadow hover:shadow-md',
              )}
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              target="_blank"
              rel="noreferrer"
            >
              <i className={cn(icon, 'text-[1.5rem] text-white')} />
            </m.a>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          className="rounded-lg px-8 py-5 text-lg font-medium  "
        >
          滚动浏览
        </Button>
        <Button
          variant="outline"
          className="rounded-lg px-8 py-5 text-lg font-medium  "
        >
          文章详情
        </Button>
      </div>
    </div>
  )
}
