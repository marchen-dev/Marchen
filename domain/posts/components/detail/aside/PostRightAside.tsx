'use client'

import type { FC, PropsWithChildren } from 'react'

export const PostRightAside: FC<PropsWithChildren> = ({ children }) => {
  return (
    <aside className="relative hidden w-full xl:ml-8 xl:block">
      <div className="sticky top-[145px] overflow-hidden ">{children}</div>
    </aside>
  )
}
