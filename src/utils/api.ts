export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface ApiError {
  detail: string
}

export interface EntryResponse {
  id: string
  user_id: string
  title: string | null
  content: string
  summary: string | null
  is_draft: boolean
  mood_rating: number | null
  tags: string[] | null
  created_at: string
  updated_at: string
  ai_processed_at: string | null
}

export interface EntryListResponse {
  entries: EntryResponse[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface EntryCreateRequest {
  title?: string | null
  content: string
  tags?: string[] | null
  is_draft?: boolean
}

export interface EntryUpdateRequest {
  title?: string | null
  content?: string | null
  tags?: string[] | null
  is_draft?: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem('access_token')

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            try {
              const newTokens = await this.refreshToken(refreshToken)
              localStorage.setItem('access_token', newTokens.access_token)
              localStorage.setItem('refresh_token', newTokens.refresh_token)
              
              // Retry original request with new token
              headers['Authorization'] = `Bearer ${newTokens.access_token}`
              const retryResponse = await fetch(url, {
                ...options,
                headers,
              })
              
              if (!retryResponse.ok) {
                const error: ApiError = await retryResponse.json().catch(() => ({
                  detail: `HTTP error! status: ${retryResponse.status}`,
                }))
                throw new Error(error.detail || 'An error occurred')
              }
              
              return retryResponse.json()
            } catch (refreshError) {
              // Refresh failed, clear tokens and throw
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              throw new Error('Session expired. Please login again.')
            }
          } else {
            throw new Error('Session expired. Please login again.')
          }
        }

        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))
        throw new Error(error.detail || 'An error occurred')
      }

      return response.json()
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection.')
      }
      throw error
    }
  }

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    return this.request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterRequest): Promise<{ id: string; email: string; created_at: string }> {
    return this.request<{ id: string; email: string; created_at: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getCurrentUser(): Promise<{ id: string; email: string; created_at: string; name?: string | null; picture?: string | null }> {
    return this.request<{ id: string; email: string; created_at: string; name?: string | null; picture?: string | null }>('/auth/me')
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // Direct fetch to avoid infinite loop with request method
    const url = `${this.baseUrl}/auth/refresh`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }))
      throw new Error(error.detail || 'Failed to refresh token')
    }

    return response.json()
  }

  async getEntries(page: number = 1, perPage: number = 10): Promise<EntryListResponse> {
    return this.request<EntryListResponse>(`/entries/?page=${page}&per_page=${perPage}`)
  }

  async createEntry(entryData: EntryCreateRequest): Promise<EntryResponse> {
    return this.request<EntryResponse>('/entries/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })
  }

  async getEntryById(id: string): Promise<EntryResponse> {
    return this.request<EntryResponse>(`/entries/${id}`)
  }

  async updateEntry(id: string, entryData: EntryUpdateRequest): Promise<EntryResponse> {
    return this.request<EntryResponse>(`/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(entryData),
    })
  }

  async searchEntries(query: string, page: number = 1, perPage: number = 10): Promise<EntryListResponse> {
    return this.request<EntryListResponse>(`/entries/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

