import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiClient, setAuthToken } from '../services/api'

interface AuthUser {
  name: string
  role: string
  email: string
}

interface AuthContextState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextState | undefined>(undefined)

const STORAGE_KEY = 'qa-dsa-auth'

interface StoredAuth {
  token: string
  email: string
  name: string
  role: string
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedRaw = window.localStorage.getItem(STORAGE_KEY)
    if (!storedRaw) {
      setLoading(false)
      return
    }

    try {
      const stored = JSON.parse(storedRaw) as StoredAuth
      setTokenState(stored.token)
      setUser({ name: stored.name, role: stored.role, email: stored.email })
      setAuthToken(stored.token)
    } catch (err) {
      console.error('Failed to parse stored auth', err)
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await apiClient.post('/auth/login', { email, password })
      const payload: StoredAuth = {
        token: data.access_token,
        email,
        name: data.user_display_name,
        role: data.role
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setAuthToken(data.access_token)
      setTokenState(data.access_token)
      setUser({ name: data.user_display_name, role: data.role, email })
    } catch (err: any) {
      const message = err?.response?.data?.detail ?? 'Unable to login with provided credentials'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY)
    setTokenState(null)
    setUser(null)
    setAuthToken(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login,
      logout
    }),
    [error, loading, login, logout, token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
