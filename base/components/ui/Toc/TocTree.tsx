'use client'
import { cn } from '@base/lib/helper'
import { useMarkdownElement } from '@domain/posts/providers/MarkdownElementProvider'
import { useEffect, useMemo, useState } from 'react'

import { ScrollArea } from '../ScrollArea'

export const TocTree = () => {
  const markdownElement = useMarkdownElement()

  const [activeId, setActiveId] = useState<string>('')
  const elementTrees = useMemo(() => {
    if (!markdownElement) {
      return []
    }
    const tree = [
      ...(markdownElement?.querySelectorAll(
        'h1,h2,h3,h4,h5,h6',
      ) as unknown as HTMLHeadingElement[]),
    ]
      .filter((element) => element.getAttribute('markdown-level') !== null)
      .map((element) => {
        const level = element.getAttribute('markdown-level')!
        return {
          title: element.textContent ?? '',
          level: +level,
          id: element.id,
        }
      })

    return tree
  }, [markdownElement])

  // 处理滚动高亮
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // 偏移量可以调整
      // 找到当前可视区域的标题
      const currentHeading = elementTrees
        .map((item) => {
          const element = document.querySelector(
            `#${item.id}`,
          ) as HTMLHeadingElement
          if (!element) return null
          const rect = element.getBoundingClientRect()
          return {
            id: item.id,
            top: element.offsetTop,
            isVisible: rect.top >= 0 && rect.top < window.innerHeight,
          }
        })
        .filter(Boolean)
        .findLast((item) => item!.top <= scrollPosition)
      // console.log(window.scrollY,currentHeading?.top, ' =========')
      // 设置当前激活的标题ID
      if (currentHeading) {
        setActiveId(currentHeading.id)
      } else {
        // 如果滚动到顶部，则取消高亮
        if (window.scrollY === 0) {
          setActiveId('')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [elementTrees])

  const handleScrollIntoView = (id: string) => {
    const target = document.querySelector(`#${id}`)
    if (target) {
      const headerOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

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
        <span className="mr-5 flex items-center gap-1">
          <i className="icon-[mingcute--book-6-line]" />
          <span>55%</span>
        </span>
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
                activeId === element.id && 'text-blue-500',
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
