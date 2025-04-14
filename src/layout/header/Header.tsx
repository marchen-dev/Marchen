import { HeaderMaster } from './HeaderMaster'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <header className="fixed z-10 h-[52px] w-full border-b border-base-300 bg-neutral-content px-8">
      <div className="mx-auto grid h-full  max-w-wider grid-cols-3 ">
        <HeaderMaster />
        <HeaderNav />
        <HeaderTools />
      </div>
    </header>
  )
}
