import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/** 返回当前视口是否处于移动端 Sidebar 断点。 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    )
    const update = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    mediaQuery.addEventListener('change', update)
    update()
    return () => mediaQuery.removeEventListener('change', update)
  }, [])

  return Boolean(isMobile)
}
