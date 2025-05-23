'use client'

import { getQueryClient } from '@marchen/lib'
import { QueryClientProvider } from '@tanstack/react-query'
import type { FC, PropsWithChildren } from 'react'

export const ReactQueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
