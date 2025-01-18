import { HeaderMaster } from './HeaderMaster'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <header className="fixed z-10 grid h-16 w-full grid-cols-3 overflow-hidden border-b border-base-300 bg-zinc-50 px-8 shadow-sm dark:bg-base-300">
      <HeaderMaster />
      <HeaderNav />
      <HeaderTools />
    </header>
  )
}
