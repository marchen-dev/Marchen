import { cn } from '@base/lib/helper'
import Link from 'next/link'

import { HeaderNavConfig } from './config'

export const HeaderNav = () => {
  return (
    <nav className="flex items-center justify-center">
      <ul className="flex gap-9">
        {HeaderNavConfig.map((item) => (
          <li key={item.href} className="flex items-center gap-1">
            <i className={cn(item.icon, 'text-xl')} />
            <Link href={item.href} className="text-lg">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
