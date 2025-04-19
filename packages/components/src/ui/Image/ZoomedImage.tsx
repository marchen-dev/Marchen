'use client'

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion'
import Image from 'next/image'
import { createElement, useRef } from 'react'

import { RootPortal } from '../Portal'

interface ZoomedImageProps {
  isOpen: boolean
  onClosed: () => void
  src: string
  alt: string
}

export const ZoomedImage = (props: ZoomedImageProps) => {
  return (
    <RootPortal>
      <AnimatePresence>
        {props.isOpen && createElement(PreviewedImage, props)}
      </AnimatePresence>
    </RootPortal>
  )
}
const PreviewedImage = (props: ZoomedImageProps) => {
  const { onClosed, src, alt } = props
  const { scrollY } = useScroll()
  const scrollYRef = useRef<number | null>(null)
  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (scrollYRef.current === null) {
      return (scrollYRef.current = latest)
    }
    if (scrollYRef.current - latest > 60 || latest - scrollYRef.current > 60) {
      onClosed()
    }
  })
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClosed}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="relative h-[90vh] w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt ?? 'image'}
          fill
          objectFit="contain"
          className="cursor-zoom-out"
          onClick={onClosed}
        />
      </motion.div>
    </motion.div>
  )
}
