'use client'

import { MarchenCard } from '@base/components/ui/Card'
import { createFadeInOutTransition } from '@base/components/ui/Transition/create-transition'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import type {
  PostArchiveItemType,
  PostsArchiveResponseType,
} from '@base/services/interfaces/post.interface'
import { archivesQuery } from '@domain/archives/queries/archives-query'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { m } from 'framer-motion'
import Link from 'next/link'
import type { FC } from 'react'

export default function ArchivesContent() {
  const { data } = useQuery(archivesQuery())
  const archiveTransition = createFadeInOutTransition()
  return (
    <div className="mx-auto mt-6 space-y-7">
      {data?.data.map((item) => (
        <m.div key={item.year} {...archiveTransition}>
          <ArchiveYearItem {...item} />
        </m.div>
      ))}
    </div>
  )
}

const ArchiveYearItem: FC<PostsArchiveResponseType['data'][number]> = (
  props,
) => {
  const { year, posts } = props

  return (
    <section>
      <h3 className="text-lg font-bold">
        {year}（共 {posts.length} 篇）
      </h3>
      <MarchenCard as="ul" className="mt-2 flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id}>
            <ArchivePostItem {...post} />
          </div>
        ))}
      </MarchenCard>
    </section>
  )
}

const ArchivePostItem: FC<PostArchiveItemType> = (props) => {
  const { title, slug, category, created } = props

  return (
    <m.li className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <time className="shrink-0 text-zinc-500">
          {dayjs(created).format('MM-DD')}
        </time>
        <m.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Link
            href={routerBuilder(Routes.POST, {
              slug,
              category: category.name,
            })}
            className="line-clamp-1 font-medium transition-colors hover:text-secondary "
          >
            {title}
          </Link>
        </m.div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 text-sm text-zinc-500">
        <span>{category.name}</span>
      </div>
    </m.li>
  )
}
