import { API_URL, getToken, getTokenOnServer, isServerSide } from '@marchen/lib'
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

export { Delete, Get, Patch, Post, Put }
export type { Error }
