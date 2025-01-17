'use client'

import queryClient from '@base/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { domMax, LazyMotion } from 'framer-motion'
import { Provider as JotaiProvider } from 'jotai'
import { ThemeProvider } from 'next-themes'
import type { FC, JSX, PropsWithChildren } from 'react'

import { jotaiStore } from '~/atoms/store'

import { ProviderComposer } from './ProviderComposer'

const contexts: JSX.Element[] = [
  <LazyMotion features={domMax} key="lazyMotion" />,
  <QueryClientProvider client={queryClient} key="queryClientProvider" />,
  <JotaiProvider store={jotaiStore} key="jotaiProvider" />,
  <ThemeProvider key="ThemeProvider" attribute={['data-theme', 'class']} />,
]
export const MarchenProviders: FC<PropsWithChildren> = ({ children }) => (
  <ProviderComposer contexts={contexts}>
    {children}
    {/* {isDev && (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
    )} */}
  </ProviderComposer>
)
