'use client'
import { cn } from '@base/lib/helper'
import { useMarkdownElement } from '@domain/posts/providers/MarkdownElementProvider'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash-es'
import { memo, useMemo, useState } from 'react'

import { ScrollArea } from '../ScrollArea'

const scrollYProgressAtom = atom(0)
const titleOffset = 80

export const TocTree = () => {
  const markdownElement = useMarkdownElement()
  const { scrollY } = useScroll()
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

    const tree = headings.map((heading) => {
      const level = heading.getAttribute('markdown-level')!

      return {
        title: heading.textContent ?? '',
        level: +level,
        id: heading.id,
      }
    })

    return tree
  }, [markdownElement])
  // console.log(elementTrees);
  useMotionValueEvent(
    scrollY,
    'change',
    throttle((pageScrollY) => {
      if (!markdownElement || elementTrees.length === 0) {
        return
      }
      const scrollPosition = window.scrollY + titleOffset
      const headings = [
        ...(markdownElement?.querySelectorAll(
          'h1,h2,h3,h4,h5,h6',
        ) as unknown as HTMLHeadingElement[]),
      ].filter((element) => element.getAttribute('markdown-level') !== null)

      const heading = headings.findLast((heading) => {
        return heading.offsetTop <= scrollPosition
      })
      setCurrentActive({
        id: heading?.id ?? '',
      })

      const scrollProgress =
        pageScrollY /
        (markdownElement.offsetHeight +
          window.pageYOffset +
          markdownElement.getBoundingClientRect().top -
          window.innerHeight)
      setScrollYProgress(Math.min(scrollProgress, 1))
    }, 100),
  )
  const handleScrollIntoView = (id: string) => {
    const target = document.querySelector(`#${id}`)
    if (target) {
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - titleOffset

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
