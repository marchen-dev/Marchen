import type { PostResponseType } from '@marchen/api-client/interfaces/post.interface'
import { MarchenCard } from '@marchen/components/ui'
import { cn, relativeTimeToNow, routerBuilder, Routes } from '@marchen/lib'
import { m } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'
import { memo } from 'react'

interface HomePostProps {
  post: PostResponseType
  layout?: 'vertical' | 'horizontal' // Add new prop for layout
}

export const PostItem: FC<HomePostProps> = memo((props) => {
  const {
    post: { cover, title, content, tags, created, category, slug, summary },
    layout = 'vertical', // Default layout is vertical
  } = props
  return (
    <MarchenCard
      className={cn(
        'h-full overflow-hidden p-0',
        layout === 'horizontal' && 'flex',
      )}
    >
      <div
        className={cn(
          `relative  overflow-hidden`,
          layout === 'horizontal' ? 'w-1/3' : 'h-[190px]',
        )}
      >
        <Link
          href={routerBuilder(Routes.POST, { category: category.slug, slug })}
        >
          <m.div whileHover={{ scale: 1.05 }} className="relative size-full">
            <Image
              src={cover}
              sizes="auto"
              fill
              className="object-cover"
              alt={`Cover image for ${title}`}
              priority
            />
            <div className="absolute inset-x-0 -bottom-1 top-0 bg-gradient-to-t from-zinc-300/40 to-transparent dark:from-zinc-900/50 " />
          </m.div>
        </Link>
      </div>
      <div
        className={cn(
          `flex flex-col justify-between space-y-3 p-4`,
          layout === 'horizontal' ? 'w-2/3' : 'h-[calc(100%-200px)]',
        )} // Change to 2/3 for text
      >
        <div>
          <Link
            href={routerBuilder(Routes.POST, {
              category: category.slug,
              slug,
            })}
            className="line-clamp-1 text-lg font-bold"
          >
            <span className="transition-colors hover:text-secondary">
              {title}
            </span>
          </Link>
          <p className="mt-2 line-clamp-3 text-sm ">{summary ?? content}</p>
        </div>
        <div className="flex items-center justify-between space-x-2 text-sm">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {tags.map((tag) => (
              <span
                key={`tag-${tag}`}
                className="shrink-0 whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500 dark:border-zinc-900 dark:bg-zinc-700 dark:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
          <time className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-gray-500">
            {relativeTimeToNow(created)}
          </time>
        </div>
      </div>
    </MarchenCard>
  )
})
