import axios from 'axios'

export const TOKEN_KEY = 'placetrack.token'
export const USER_KEY = 'placetrack.user'

/** Axios instance pointed at the API. `/api` is proxied to the backend in dev. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

// Attach the bearer token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On an expired / invalid session, clear local state and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

/** Pulls a human-readable message out of any error shape the API can return. */
export function apiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message || error.message || 'Something went wrong.'
  }
  return 'Something went wrong. Please try again.'
}
