'use client'

import queryClient from '@base/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { domMax, LazyMotion } from 'framer-motion'
import { Provider as JotaiProvider } from 'jotai'
import { ThemeProvider } from 'next-themes'
import type { FC, JSX, PropsWithChildren } from 'react'

import { jotaiStore } from '~/atoms/store'

import { ProviderComposer } from './ProviderComposer'

const baseContexts: JSX.Element[] = [
  <LazyMotion features={domMax} key="lazyMotion" />,
  <QueryClientProvider client={queryClient} key="queryClientProvider" />,
  <JotaiProvider store={jotaiStore} key="jotaiProvider" />,
  <ThemeProvider key="ThemeProvider" attribute={['data-theme', 'class']} />,
]

const webAppContexts: JSX.Element[] = [...baseContexts]

export const WebAppProviders: FC<PropsWithChildren> = ({ children }) => (
  <ProviderComposer contexts={webAppContexts}>
    {children}
    {/* {isDev && (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
    )} */}
  </ProviderComposer>
)

const marchenAdminContexts: JSX.Element[] = [...baseContexts]

export const MarchenAdminProviders: FC<PropsWithChildren> = ({ children }) => (
  <ProviderComposer contexts={marchenAdminContexts}>
    {children}
  </ProviderComposer>
)
