import type { FC, PropsWithChildren } from 'react'

export const SiteLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="flex h-full flex-col">{children}</div>
}
