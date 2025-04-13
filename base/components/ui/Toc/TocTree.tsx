'use client'
import { cn } from '@base/lib/helper'
import { useMarkdownElement } from '@domain/posts/providers/MarkdownElementProvider'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { throttle } from 'lodash-es'
import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { ScrollArea } from '../ScrollArea'

const scrollYProgressAtom = atom(0)
const titleOffset = 80

export const TocTree = () => {
  const markdownElement = useMarkdownElement()
  const { scrollY } = useScroll()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  useEffect(
    () => () => {
      setScrollYProgress(0)
    },
    [setScrollYProgress],
  )

  useMotionValueEvent(
    scrollY,
    'change',
    // eslint-disable-next-line react-compiler/react-compiler
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

      // 当目录出现滚动条时候，选中的标题能够能够在视口中显示
      const scrollArea = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      const activeTocElement = scrollArea?.querySelector(
        `li[data-id="${currentActive.id}"]`,
      )

      if (scrollArea && activeTocElement) {
        const scrollAreaRect = scrollArea?.getBoundingClientRect()
        const activeTocElementRect = activeTocElement?.getBoundingClientRect()
        if (activeTocElementRect.bottom > scrollAreaRect.bottom - 40) {
          // 滚动到当前项，使其在可视区域内更居中的位置
          scrollArea.scrollBy({
            top: activeTocElementRect.bottom - scrollAreaRect.bottom + 80,
            behavior: 'smooth',
          })
        } else if (activeTocElementRect.top < scrollAreaRect.top + 40) {
          scrollArea.scrollBy({
            top: activeTocElementRect.top - scrollAreaRect.top - 40,
            behavior: 'smooth',
          })
        }
      }
    }, 150),
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
    <div className="size-full text-sm">
      <p className="flex items-center justify-between">
        <span>目录</span>
        <Progress />
      </p>
      <ScrollArea className="mt-3 h-4/5 " ref={scrollAreaRef}>
        <ul className="pr-2 text-zinc-600 dark:text-zinc-400">
          {elementTrees.map((element) => (
            <li
              key={element.id}
              data-id={element.id}
              style={{
                paddingLeft: `${(element.level - 1) * 10}px`,
              }}
              className={cn(
                'line-clamp-2 cursor-pointer py-1 text-left',
                currentActive.id === element.id &&
                  'font-bold text-zinc-900 dark:text-zinc-100',
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
