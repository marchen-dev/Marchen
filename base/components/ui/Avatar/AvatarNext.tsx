import { cn } from '@base/lib/helper'
import type { ImageProps } from 'next/image'
import Image from 'next/image'
import type { FC } from 'react'

export const AvatarNext: FC<ImageProps> = (props) => {
  const { className } = props
  return (
    <Image
      className={cn('rounded-full border-2 border-neutral-content', className)}
      {...props}
    />
  )
}
