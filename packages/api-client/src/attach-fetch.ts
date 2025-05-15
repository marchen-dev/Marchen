'use server'

import { headers } from 'next/headers'

import PKG from '../../../package.json'
import { attachFetchHeader } from './fetch'

export const attachServerFetch = async () => {
  const { get } = await headers()

  const ua = get('user-agent')
  const ip =
    get('x-real-ip') ||
    get('x-forwarded-for') ||
    get('remote-addr') ||
    get('cf-connecting-ip')

  if (ip) {
    attachFetchHeader('x-real-ip', ip)
    attachFetchHeader('x-forwarded-for', ip)
  }
  attachFetchHeader(
    'User-Agent',
    `${ua} NextJS/v${PKG.dependencies.next} ${PKG.name}/${PKG.version}`,
  )
}
