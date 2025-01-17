import { cn } from '@base/lib/helper'
import Link from 'next/link'

import { HeaderNavConfig } from './config'

export const HeaderNav = () => {
  return (
    <nav className="flex items-center justify-center">
      <ul className="flex shrink-0 gap-10">
        {HeaderNavConfig.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="flex items-center gap-1">
              <i className={cn(item.icon, 'hidden text-xl', 'lg:inline')} />
              <span className="text-lg"> {item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
