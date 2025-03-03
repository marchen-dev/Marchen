import { env } from 'next-runtime-env'

export const isClientSide = typeof window !== 'undefined'
export const isServerSide = !isClientSide

export const isDev = process.env.NODE_ENV === 'development'

export const API_URL = env('NEXT_PUBLIC_API_URL')
