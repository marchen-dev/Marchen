import { DesktopNav } from './HeaderDesktopNav'
import { MobileNav } from './HeaderMobileNav'

export const HeaderNav = () => {
  return (
    <nav className="flex items-center justify-center">
      <DesktopNav />
      <MobileNav />
    </nav>
  )
}
