const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USER_KEY = 'user'

const isBrowser = typeof window !== 'undefined'
export const setTokens = (accessToken: string, refreshToken: string) => {
  if (!isBrowser) return
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  document.cookie = `access_token=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`
}

export const getAccessToken = (): string | null => {
  if (!isBrowser) return null
  return localStorage.getItem(TOKEN_KEY)
}

export const getRefreshToken = (): string | null => {
  if (!isBrowser) return null
  return localStorage.getItem(REFRESH_KEY)
}

export const setUser = (user: { id: string; email: string }) => {
  if (!isBrowser) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getUser = (): { id: string; email: string } | null => {
  if (!isBrowser) return null
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const clearAuth = () => {
  if (!isBrowser) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  document.cookie = 'access_token=; path=/; max-age=0'
}

export const isAuthenticated = (): boolean => {
  if (!isBrowser) return false
  return !!localStorage.getItem(TOKEN_KEY)
}