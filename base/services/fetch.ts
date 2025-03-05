'use server'

import { getTokenOnServer } from '@base/lib/cookie.server'
import { API_URL } from '@base/lib/env'
import { ofetch } from 'ofetch'

const apiFetch = ofetch.create({
  baseURL: API_URL,
  onRequest: async (context) => {
    const token = await getTokenOnServer()
    context.options.headers.set('Authorization', `Bearer ${token}`)
  },
})

const Get = <T = object>(url: string, params?: object): Promise<T> =>
  apiFetch(url, { query: params })

const Post = <T = object>(url: string, data?: object): Promise<T> =>
  apiFetch(url, { method: 'POST', body: data })

const Delete = <T = object>(url: string, params?: object): Promise<T> =>
  apiFetch(url, { method: 'DELETE', query: params })

type Error = {
  data: {
    status: number
    message: string | string[]
  }
}

export { Delete, Get, Post }
export type { Error }
