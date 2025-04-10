'use client'

import type { FC, PropsWithChildren } from 'react'

export const PostRightAside: FC<PropsWithChildren> = ({ children }) => {
  return (
    <aside className="relative hidden xl:block">
      <div className="sticky top-[145px] ">{children}</div>
    </aside>
  )
}
