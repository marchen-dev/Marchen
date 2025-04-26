import { env } from 'next-runtime-env'

export const isClientSide = typeof window !== 'undefined'
export const isServerSide = !isClientSide

export const isDev = process.env.NODE_ENV === 'development'

export const API_URL = env('NEXT_PUBLIC_API_URL')
export const AI_STREAM_URL = `${API_URL}/ai/stream`
export const TURNSTILE_SITE_KEY = env('NEXT_PUBLIC_TURNSTILE_SITE_KEY')
export const enableTurnstile = !!TURNSTILE_SITE_KEY
