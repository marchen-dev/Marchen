import { jotaiStore, viewportAtom } from '@marchen/atom'
import { throttle } from 'lodash-es'
import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

export const ViewPortProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const handleResize = throttle(() => {
      const { innerWidth, innerHeight } = window
      jotaiStore.set(viewportAtom, {
        isMobile: innerWidth < 768,
        isTablet: innerWidth >= 768 && innerWidth < 1024,
        isDesktop: innerWidth >= 1024,
        isLargeDesktop: innerWidth >= 1440,
        width: innerWidth,
        height: innerHeight,
      })
    }, 200) // 包裹防抖逻辑
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return children
}
