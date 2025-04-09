'use client'

import { useIsMobile } from '@base/hooks/use-mobile'
import Image from 'next/image'
import type { ComponentPropsWithoutRef, FC } from 'react'
import { useState } from 'react'

import { ZoomedImage } from '../../Image/ZoomedImage'

export const MarkdownImage: FC<ComponentPropsWithoutRef<'img'>> = ({
  src,
  alt,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const toggleOpen = () => {
    if (isMobile) {
      return window.open(src, '_blank')
    }
    setIsOpen(!isOpen)
  }

  if (!src) return null
  return (
    <span className=" my-2 flex flex-col px-2">
      <Image
        src={src}
        alt={alt ?? 'image'}
        width={800}
        height={600}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ width: '100%', height: 'auto', cursor: 'zoom-in' }}
        className="rounded-md"
        priority
        onClick={toggleOpen}
      />
      <span className="mt-4 text-center">
        <span className="  border-b-2  text-sm ">{alt}</span>
      </span>
      <ZoomedImage
        isOpen={isOpen}
        onClosed={() => setIsOpen(false)}
        src={src}
        alt={alt ?? 'image'}
      />
    </span>
  )
}
