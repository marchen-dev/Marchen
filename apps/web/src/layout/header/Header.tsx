import { HeaderDesktopNav } from './HeaderDesktopNav'
import { HeaderMaster } from './HeaderMaster'
import { HeaderMobileNav } from './HeaderMobileNav'
import { HeaderNavTitle } from './HeaderNavTitle'

export default function Header() {
  return (
    <header className="fixed z-10 h-[52px] w-full border-b border-base-300 bg-neutral-content px-4">
      <div className="mx-auto grid h-full  max-w-wider grid-cols-3 ">
        <HeaderMaster />
        <HeaderNavTitle />
        <>
          <HeaderDesktopNav />
          <HeaderMobileNav />
        </>
      </div>
    </header>
  )
}
