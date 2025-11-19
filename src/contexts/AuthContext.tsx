import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, TokenResponse } from '../utils/api'

interface UserInfo {
  id: string
  email: string
  created_at: string
  picture?: string | null
  name?: string | null
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  setTokens: (tokens: TokenResponse) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserInfo | null>(null)
  const navigate = useNavigate()

  const fetchUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser()
      setUser(userData)
    } catch (err) {
      // Silently fail - user might not be authenticated
      // Token refresh will be handled by API client
      if (err instanceof Error && err.message.includes('Session expired')) {
        setIsAuthenticated(false)
        setUser(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
  }

  useEffect(() => {
    // Check if user has tokens stored
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (accessToken && refreshToken) {
      setIsAuthenticated(true)
      fetchUser()
    }
    setIsLoading(false)
  }, [])

  const setTokens = (tokens: TokenResponse) => {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    setIsAuthenticated(true)
    fetchUser()
  }

  const login = async (email: string, password: string) => {
    const tokens = await apiClient.login({ email, password })
    setTokens(tokens)
  }

  const register = async (email: string, password: string) => {
    await apiClient.register({ email, password })
    // After registration, automatically log in
    const tokens = await apiClient.login({ email, password })
    setTokens(tokens)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setIsAuthenticated(false)
    setUser(null)
    navigate('/login')
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        logout,
        setTokens,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

