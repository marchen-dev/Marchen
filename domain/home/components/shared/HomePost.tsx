import { HomeCard } from '@base/components/ui/Card'
import { relativeTimeToNow } from '@base/lib/day'
import { cn } from '@base/lib/helper'
import type { PostResponseType } from '@base/services/interfaces/post.interface'
import { m } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { FC } from 'react'
import { memo } from 'react'

import { imageVariants, tagVariants } from '../../lib/home-motion'

interface HomePostProps {
  post: PostResponseType
  layout?: 'vertical' | 'horizontal' // Add new prop for layout
}

export const HomePost: FC<HomePostProps> = memo((props) => {
  const {
    post: { cover, title, content, tags, created },
    layout = 'vertical', // Default layout is vertical
  } = props
  return (
    <HomeCard
      className={cn(
        'h-full overflow-hidden p-0',
        layout === 'horizontal' && 'flex',
      )}
    >
      <div
        className={`relative ${layout === 'horizontal' ? 'w-1/3' : 'h-[180px]'} overflow-hidden`} // Change to 1/3 for image
      >
        <m.div
          className="absolute inset-0"
          variants={imageVariants}
          initial="initial"
        >
          <Image
            src={cover}
            fill
            className="object-cover"
            alt={`Cover image for ${title}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </m.div>
        <m.div
          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300"
          whileHover={{ opacity: 0.7 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div
        className={`flex ${layout === 'horizontal' ? 'w-2/3' : 'h-[calc(100%-180px)]'} flex-col justify-between space-y-3 p-4`} // Change to 2/3 for text
      >
        <div>
          <Link
            href={''}
            className="line-clamp-1 text-lg font-bold text-gray-800"
          >
            {title}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{content}</p>
        </div>
        <div className="flex items-center justify-between space-x-2 text-sm">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <m.i
              className="icon-[mingcute--tag-2-line] shrink-0"
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 5 }}
            />
            <div className="flex items-center gap-1 overflow-x-auto">
              {tags.map((tag, i) => (
                <m.span
                  key={`tag-${tag}`}
                  className="shrink-0 whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-500"
                  custom={i}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  variants={tagVariants}
                >
                  {tag}
                </m.span>
              ))}
            </div>
          </div>
          <m.time
            className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-gray-500"
            whileHover={{ scale: 1.05 }}
          >
            <m.i
              className="icon-[mingcute--time-duration-line] shrink-0 text-lg text-gray-400"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 8 }}
            />
            {relativeTimeToNow(created)}
          </m.time>
        </div>
      </div>
    </HomeCard>
  )
})
