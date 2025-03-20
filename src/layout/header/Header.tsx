import { HeaderMaster } from './HeaderMaster'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <header className="fixed  z-10 h-[3.25rem] w-full overflow-hidden border-b border-base-300 bg-base-100 px-8 shadow-sm dark:bg-base-300">
      <div className="mx-auto grid h-full  max-w-content grid-cols-3 ">
        <HeaderMaster />
        <HeaderNav />
        <HeaderTools />
      </div>
    </header>
  )
}
