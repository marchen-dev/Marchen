'use server'

import { cookies } from 'next/headers'

import { TokenKey } from './cookie'

export async function getTokenOnServer() {
  const cookieStore = await cookies()
  const token = cookieStore.get(TokenKey)?.value

  return token ?? null
}
