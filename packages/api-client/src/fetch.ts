import { API_URL, getToken, getTokenOnServer, isServerSide } from '@marchen/lib'
import { ofetch } from 'ofetch'

import PKG from '../../../package.json'
import { attachServerFetch } from './attach-fetch'

const globalConfigureHeader = {} as Record<string, string>
if (isServerSide) {
  globalConfigureHeader['User-Agent'] =
    `NextJS/v${PKG.dependencies.next} ${PKG.name}/${PKG.version}`
}
const apiFetch = ofetch.create({
  baseURL: API_URL,
  onRequest: async (context) => {
    let token = null
    const { headers } = context.options
    if (isServerSide) {
      await attachServerFetch()
      headers.set('User-Agent', globalConfigureHeader['User-Agent'])
      headers.set('x-real-ip', globalConfigureHeader['x-real-ip'])
      headers.set('x-forwarded-for', globalConfigureHeader['x-forwarded-for'])
      token = await getTokenOnServer()
    } else {
      token = getToken()
    }
    if (token) {
      context.options.headers.set('Authorization', `Bearer ${token}`)
    }
  },
})

const Get = <T = object>(url: string, params?: object): Promise<T> =>
  apiFetch(url, { query: params })

const Post = <T = object>(url: string, data?: object): Promise<T> =>
  apiFetch(url, { method: 'POST', body: data })

const Delete = <T = object>(
  url: string,
  params?: { query?: object; body?: object },
): Promise<T> =>
  apiFetch(url, { method: 'DELETE', query: params?.query, body: params?.body })

const Patch = <T = object>(url: string, data?: object): Promise<T> =>
  apiFetch(url, { method: 'PATCH', body: data })

const Put = <T = object>(url: string, data?: object): Promise<T> =>
  apiFetch(url, { method: 'PUT', body: data })

type Error = {
  data: {
    status: number
    message: string | string[]
  }
}

const attachFetchHeader = (key: string, value: string | null) => {
  const original = globalConfigureHeader[key]
  if (value === null) {
    delete globalConfigureHeader[key]
  } else {
    globalConfigureHeader[key] = value
  }

  return () => {
    if (original === undefined) {
      delete globalConfigureHeader[key]
    } else {
      globalConfigureHeader[key] = original
    }
  }
}

export { attachFetchHeader, Delete, Get, Patch, Post, Put }
export type { Error }
