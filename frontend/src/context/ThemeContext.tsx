import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

interface ThemeContextState {
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextState | undefined>(undefined)

const THEME_KEY = 'qa-dsa-theme'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null
    if (stored) {
      setMode(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    window.localStorage.setItem(THEME_KEY, mode)
  }, [mode])

  const value = useMemo(
    () => ({
      mode,
      toggleTheme: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
      setTheme: setMode
    }),
    [mode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
