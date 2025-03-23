import { Button } from '@base/components/ui/Button'
import { routerBuilder, Routes } from '@base/lib/route-builder'
import { usePostsSelector } from '@domain/posts/atom/selectors/posts-selector'
import { useRouter } from 'next/navigation'
import type { ComponentProps, FC } from 'react'

export const PostPaginationArea = () => {
  const page = usePostsSelector((state) => state.page)
  const totalPages = usePostsSelector((state) => state.totalPages)
  const router = useRouter()

  const hasPrev = page > 1
  const hasNext = page < totalPages

  const handlePageChange = (type: 'prev' | 'next') => {
    switch (type) {
      case 'prev': {
        router.push(
          routerBuilder(Routes.POSTS, {
            page: page - 1,
          }),
        )
        break
      }
      case 'next': {
        router.push(
          routerBuilder(Routes.POSTS, {
            page: page + 1,
          }),
        )
      }
    }
  }

  return (
    <div className="mt-5 flex w-full items-center justify-end gap-5 pb-8">
      {hasPrev && (
        <PaginationButton
          direction="left"
          label="上一页"
          onClick={() => handlePageChange('prev')}
        />
      )}
      {hasNext && (
        <PaginationButton
          direction="right"
          label="下一页"
          onClick={() => handlePageChange('next')}
        />
      )}
    </div>
  )
}

interface PaginationButtonProps extends ComponentProps<typeof Button> {
  direction: 'left' | 'right'
  label: string
}

const PaginationButton: FC<PaginationButtonProps> = (props) => {
  const { direction, label, ...rest } = props
  return (
    <Button variant="outline" {...rest} className="flex  gap-2">
      {/* {direction === 'left' && <ChevronLeft className="size-4" />} */}
      {direction === 'left' && (
        <i className="icon-[mingcute--left-line] size-4" />
      )}
      <span>{label}</span>
      {direction === 'right' && (
        <i className="icon-[mingcute--right-line] size-4" />
      )}
    </Button>
  )
}
