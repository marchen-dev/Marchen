import type { FC, PropsWithChildren } from 'react'

declare global {
  export type NextPageParams<
    P extends object,
    Props = object,
  > = PropsWithChildren<
    {
      params: P
    } & Props
  >

  export type Component<P = object> = FC<ComponentType & P>

  export type ComponentType<P = object> = {
    className?: string
  } & PropsWithChildren &
    P
}

export {}
