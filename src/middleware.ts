import { REQUEST_PATHNAME, REQUEST_QUERY } from '@base/constants/request'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const headers = new Headers(req.headers)
  headers.set(REQUEST_PATHNAME, pathname)
  headers.set(REQUEST_QUERY, search)
  return NextResponse.next({
    request: {
      headers,
    },
  })
}
