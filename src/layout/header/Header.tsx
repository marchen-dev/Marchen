import { HeaderMaster } from './HeaderMaster'
import { HeaderMotion } from './HeaderMotion'
import { HeaderNav } from './HeaderNav'
import { HeaderTools } from './HeaderTools'

export default function Header() {
  return (
    <HeaderMotion>
      <HeaderMaster />
      <HeaderNav />
      <HeaderTools />
    </HeaderMotion>
  )
}
