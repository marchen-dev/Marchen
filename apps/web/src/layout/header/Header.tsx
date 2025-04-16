import { HeaderDesktopNav } from './HeaderDesktopNav'
import { HeaderMaster } from './HeaderMaster'
import { HeaderMobileNav } from './HeaderMobileNav'
import { HeaderNavTitle } from './HeaderNavTitle'

export default function Header() {
  return (
    <header className="border-base-300 bg-neutral-content fixed z-10 h-[52px] w-full border-b px-4">
      <div className="max-w-wider mx-auto grid  h-full grid-cols-3 ">
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
