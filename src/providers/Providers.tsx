'use client'

import queryClient from '@base/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { domMax, LazyMotion } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import type { FC, JSX, PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

import { ProviderComposer } from './ProviderComposer'
import { JotaiProvider } from './root/JotaiProvider'
import { ViewPortProvider } from './root/ViewPortProvider'

const baseContexts: JSX.Element[] = [
  <LazyMotion features={domMax} key="lazyMotion" />,
  <QueryClientProvider client={queryClient} key="queryClientProvider" />,
  <ThemeProvider key="ThemeProvider" attribute={['data-theme', 'class']} />,
  <JotaiProvider key="JotaiProvider" />,
  <ViewPortProvider key="ViewPortProvider" />,
]

const webAppContexts: JSX.Element[] = [...baseContexts]

export const WebAppProviders: FC<PropsWithChildren> = ({ children }) => (
  <ProviderComposer contexts={webAppContexts}>
    {children}
    <Toaster />
    {/* {isDev && (
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
    )} */}
  </ProviderComposer>
)

const marchenAdminContexts: JSX.Element[] = [...baseContexts]

export const MarchenAdminProviders: FC<PropsWithChildren> = ({ children }) => (
  <ProviderComposer contexts={marchenAdminContexts}>
    {children}
    <Toaster />
  </ProviderComposer>
)
