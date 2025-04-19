import { useCallback } from 'react'

export const useScrollToPosts = () => {
  const handleScrollToPosts = useCallback(() => {
    const target = document.querySelector('#home-scroll-target')
    if (target) {
      const headerHeight = 80
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - headerHeight
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      })
    }
  }, [])
  return { handleScrollToPosts }
}
