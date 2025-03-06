import { getToken } from '@base/lib/cookie'
import { getTokenOnServer } from '@base/lib/cookie.server'
import { API_URL, isServerSide } from '@base/lib/env'
import { ofetch } from 'ofetch'

const apiFetch = ofetch.create({
  baseURL: API_URL,
  onRequest: async (context) => {
    let token = null
    if (isServerSide) {
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
