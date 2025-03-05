import Cookies from 'js-cookie'

export const TokenKey = 'marchen-token'

export function getToken(): string | null {
  const token = Cookies.get(TokenKey)

  return token || null
}

export function setToken(token: string, expires: number) {
  if (!token) {
    return
  }
  return Cookies.set(TokenKey, token, {
    expires,
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
