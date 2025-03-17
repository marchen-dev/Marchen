import { HeaderMaster } from './HeaderMaster'
import { HeaderMotion } from './HeaderMotion'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <HeaderMotion>
      <div className="mx-auto grid h-full  max-w-content grid-cols-3 ">
        <HeaderMaster />
        <HeaderNav />
        <HeaderTools />
      </div>
    </HeaderMotion>
  )
}
