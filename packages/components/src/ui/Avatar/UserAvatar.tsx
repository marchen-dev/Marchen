import { cn } from '@marchen/lib'
import type { ImageProps } from 'next/image'
import Image from 'next/image'
import type { FC } from 'react'

export const UserAvatar: FC<ImageProps> = (props) => {
  const { className } = props
  return (
    <Image
      className={cn('rounded-full border-2 border-neutral-content', className)}
      priority
      {...props}
    />
  )
}
