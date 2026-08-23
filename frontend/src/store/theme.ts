import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('placetrack_theme') as Theme | null
  if (saved === 'dark' || saved === 'light') {
    applyThemeClass(saved)
    return saved
  }
  // Default is light mode
  applyThemeClass('light')
  return 'light'
}

export const useTheme = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    localStorage.setItem('placetrack_theme', theme)
    applyThemeClass(theme)
    set({ theme })
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('placetrack_theme', nextTheme)
      applyThemeClass(nextTheme)
      return { theme: nextTheme }
    })
  },
}))
