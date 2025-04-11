'use client'
import { cn } from '@base/lib/helper'
import { useMarkdownElement } from '@domain/posts/providers/MarkdownElementProvider'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash-es'
import { memo, useMemo, useState } from 'react'

import { ScrollArea } from '../ScrollArea'

const scrollYProgressAtom = atom(0)

export const TocTree = () => {
  const markdownElement = useMarkdownElement()
  const { scrollYProgress } = useScroll()
  const setScrollYProgress = useSetAtom(scrollYProgressAtom)
  const [currentActive, setCurrentActive] = useState({
    id: '',
  })
  const elementTrees = useMemo(() => {
    if (!markdownElement) {
      return []
    }
    const headings = [
      ...(markdownElement?.querySelectorAll(
        'h1,h2,h3,h4,h5,h6',
      ) as unknown as HTMLHeadingElement[]),
    ].filter((element) => element.getAttribute('markdown-level') !== null)
    if (headings.length === 0) {
      return []
    }

    let currentElementHeight = 0

    const headingElementTotalHeight =
      markdownElement.offsetHeight - headings[0].offsetTop

    const tree = headings.map((heading, index) => {
      const level = heading.getAttribute('markdown-level')!
      const headingOffsetTop = heading.offsetTop
      let elementHeight = 0
      if (index !== headings.length - 1) {
        elementHeight = headings[index + 1].offsetTop - headingOffsetTop
      } else {
        elementHeight = markdownElement.offsetHeight - headingOffsetTop
      }
      currentElementHeight += elementHeight
      return {
        title: heading.textContent ?? '',
        level: +level,
        id: heading.id,
        heightPercentage: currentElementHeight / headingElementTotalHeight,
      }
    })

    return tree
  }, [markdownElement])

  useMotionValueEvent(
    scrollYProgress,
    'change',
    throttle((latest) => {
      let currentProgress = latest
      if (latest > 1) {
        currentProgress = 1
      }
      setScrollYProgress(currentProgress)
      if (elementTrees.length === 0) {
        return
      }
      const target = elementTrees.find(
        (element) => element.heightPercentage >= currentProgress,
      )

      if (target && target.id !== currentActive.id) {
        setCurrentActive({
          id: target.id,
        })
      }
    }, 100),
  )
  const handleScrollIntoView = (id: string) => {
    if (!markdownElement) {
      return
    }
    const targetIndex =
      elementTrees.findIndex((element) => element.id === id) - 1
    if (targetIndex < 0) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }
    const target = elementTrees[targetIndex]
    if (target) {
      if (target === elementTrees[0]) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
        return
      }
      const offsetPosition =
        target.heightPercentage * markdownElement.offsetHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }
  return (
    <div className="text-sm">
      <p className="flex items-center justify-between">
        <span>目录</span>
        <Progress />
      </p>
      <ScrollArea className="mt-3 h-[500px]" type="scroll">
        <ul className=" text-zinc-600">
          {elementTrees.map((element) => (
            <li
              key={element.id}
              style={{
                paddingLeft: `${element.level * 10}px`,
              }}
              className={cn(
                'cursor-pointer py-1 text-left',
                currentActive.id === element.id && 'text-blue-500',
              )}
              onClick={() => handleScrollIntoView(element.id)}
            >
              {element.title}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}

const Progress = memo(() => {
  const scrollYProgress = useAtomValue(scrollYProgressAtom)
  return (
    <span className="mr-5 flex items-center gap-1">
      <i className="icon-[mingcute--book-6-line]" />
      <span>{Math.round(scrollYProgress * 100)}%</span>
    </span>
  )
})
