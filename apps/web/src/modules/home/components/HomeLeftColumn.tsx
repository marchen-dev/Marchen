'use client'

import { UserAvatar } from '@marchen/components/ui'
import { cn, parseSocialIcon } from '@marchen/lib'
import { m } from 'framer-motion'
import { useMemo } from 'react'

import { useAggregationDataSelector } from '~/providers/root/AggregationDataProvider'

export const HomeLeftColumn = () => {
  const user = useAggregationDataSelector((state) => state?.user)
  const siteTitle = useAggregationDataSelector((state) => state?.site.title)
  const socialMedias = useMemo(
    () => parseSocialIcon(user?.social ?? {}),
    [user?.social],
  )
  return (
    <div className="flex flex-col items-center gap-5 lg:items-start">
      <m.div
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <UserAvatar
          src={user?.avatar ?? ''}
          alt={user?.name ?? ''}
          width={150}
          height={150}
        />
      </m.div>

      <m.h3
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        custom={1}
        className="text-3xl font-medium lg:text-4xl"
      >
        {siteTitle}
      </m.h3>
      <m.h4
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        custom={2}
        className="text-xl lg:text-2xl"
      >
        {user?.introduce}
      </m.h4>
      <m.ul
        className="mt-6 flex gap-4"
        variants={fadeInUpVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      >
        {socialMedias.map(({ color, icon, link, name }, index) => (
          <m.li
            key={name}
            variants={socialIconVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <m.a
              href={link}
              className={cn(
                'flex size-10 items-center justify-center rounded-full text-base-100 shadow-sm transition-shadow hover:shadow-md',
              )}
              style={{ backgroundColor: `${color}20` }}
              whileHover="hover"
              whileTap="tap"
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={cn(icon, 'text-2xl text-white')}
                style={{ color }}
              />
            </m.a>
          </m.li>
        ))}
      </m.ul>
    </div>
  )
}

// 定义统一的动画变量
const fadeInUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      delay: 0.1 + custom * 0.05,
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  }),
}

const socialIconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (custom: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      delay: 0.2 + custom * 0.05,
      type: 'spring',
      stiffness: 200,
    },
  }),
  hover: { scale: 1.15, rotate: 5 },
  tap: { scale: 0.9 },
}
