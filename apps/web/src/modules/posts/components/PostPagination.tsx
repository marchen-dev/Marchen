import { LoadingThreeDotsJumping } from '@marchen/components/ui'
import { useInView } from 'framer-motion'
import type { FC } from 'react'
import { useEffect, useRef } from 'react'

interface PostPaginationAreaProps {
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const PostPaginationArea: FC<PostPaginationAreaProps> = (props) => {
  const { isFetchingNextPage, hasNextPage, fetchNextPage } = props
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref)
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div
      className="mt-5 flex w-full items-center justify-center gap-5"
      ref={ref}
    >
      {isFetchingNextPage ? (
        <LoadingThreeDotsJumping className="mt-10" />
      ) : null}
    </div>
  )
}
