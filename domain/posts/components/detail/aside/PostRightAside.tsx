'use client'

import { m } from 'framer-motion'
import type { FC, PropsWithChildren } from 'react'
import { Fragment } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const PostRightAside: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<Fragment />}>
      <m.aside
        className="relative hidden w-full xl:ml-8 xl:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="sticky top-[100px] mt-[100px] h-[60vh] min-h-[120px] overflow-hidden">
          {children}
        </div>
      </m.aside>
    </ErrorBoundary>
  )
}
