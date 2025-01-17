import { HeaderMaster } from './HeaderMaster'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <header className="grid h-16 grid-cols-3 overflow-hidden border-b border-base-300 bg-zinc-50 px-8 dark:bg-base-300">
      <HeaderMaster />
      <HeaderNav />
      <HeaderTools />
    </header>
  )
}
