import { create } from 'zustand'
import { TOKEN_KEY, USER_KEY } from '../lib/api'
import type { User } from '../lib/types'

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  signIn: (token: string, user: User) => void
  signOut: () => void
}

/** Global auth state, mirrored into localStorage so sessions survive reloads. */
export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: readUser(),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  signIn: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  signOut: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
