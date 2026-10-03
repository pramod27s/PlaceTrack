import axios from 'axios'
import { useAuth } from '../store/auth'

export const TOKEN_KEY = 'placetrack.token'
export const USER_KEY = 'placetrack.user'
export const GEMINI_API_KEY_STORAGE = 'placetrack.gemini_api_key'

/** Axios instance pointed at the API. `/api` is proxied to the backend in dev. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

// Attach the bearer token and optional custom Gemini API key to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const customGeminiKey = localStorage.getItem(GEMINI_API_KEY_STORAGE)
  if (customGeminiKey && customGeminiKey.trim()) {
    config.headers['X-Gemini-Api-Key'] = customGeminiKey.trim()
  }
  return config
})

// On an expired / invalid session (401 Unauthorized), clear local state and bounce to login.
// 403 means "authenticated but not allowed" and is surfaced to the caller instead.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState().signOut()
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
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message || data?.error || error.message || 'Something went wrong.'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

/**
 * Per-field validation messages from a 400 response
 * (`{ fieldErrors: { name: "must not be blank" } }`), or an empty object.
 */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { fieldErrors?: Record<string, string> } | undefined
    if (data?.fieldErrors && typeof data.fieldErrors === 'object') return data.fieldErrors
  }
  return {}
}

import type { ParsedCompanyData, ParsedRoundData } from './types'

export async function parseCompanyNotice(rawText: string): Promise<ParsedCompanyData> {
  const { data } = await api.post<ParsedCompanyData>('/ai/parse-company-notice', { rawText })
  return data
}

export async function parseRoundNotice(rawText: string): Promise<ParsedRoundData> {
  const { data } = await api.post<ParsedRoundData>('/ai/parse-round-notice', { rawText })
  return data
}
