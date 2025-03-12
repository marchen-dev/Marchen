import { useToolStore } from '@base/store/tool'
import type { FC, PropsWithChildren } from 'react'
import { useEffect } from 'react'

export const ViewPortProvider: FC<PropsWithChildren> = ({ children }) => {
  const { updateViewPort } = useToolStore()
  useEffect(() => {
    const handleResize = () => updateViewPort() // 包裹防抖逻辑
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  return children
}
