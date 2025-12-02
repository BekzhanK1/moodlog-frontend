export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1'

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

export interface EmotionalProfile {
  average_mood: number
  dominant_emotions: string[]
  emotional_range: string
}

export interface WritingStyle {
  average_length: string
  tone: string
  common_patterns: string[]
}

export interface UserCharacteristicResponse {
  general_description?: string | null
  main_themes?: string[] | null
  emotional_profile?: EmotionalProfile | null
  writing_style?: WritingStyle | null
}

// Subscription types
export interface PlanResponse {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  duration_days: number | null
  features: {
    ai_questions_per_day: number | null
    has_themes: boolean
    has_weekly_insights: boolean
    has_monthly_insights: boolean
    has_voice_recording: boolean
    has_visual_themes: boolean
    has_visual_effects: boolean
  }
}

export interface PlansListResponse {
  plans: PlanResponse[]
}

export interface SubscriptionResponse {
  plan: string
  plan_name: string
  status: string
  started_at: string | null
  expires_at: string | null
  trial_used: boolean
  features: {
    ai_questions_per_day: number | null
    has_themes: boolean
    has_weekly_insights: boolean
    has_monthly_insights: boolean
    has_voice_recording: boolean
    has_visual_themes: boolean
    has_visual_effects: boolean
  }
  is_active: boolean
}

export interface SubscribeRequest {
  plan: 'pro_month' | 'pro_year'
}

export interface SubscribeResponse {
  payment_id: string
  order_id: string
  payment_url: string
  amount: number
}

export interface PaymentStatusResponse {
  payment_id: string
  status: string
  webkassa_status: string | null
  order_id: string | null
}

export interface StartTrialResponse {
  message: string
  expires_at: string
}

// Promo code types
export interface PromoCodeCreateRequest {
  plan: 'pro_month' | 'pro_year'
  code?: string
  expires_at?: string
  max_uses?: number
}

export interface PromoCodeResponse {
  id: string
  code: string
  plan: string
  created_by: string
  max_uses: number
  uses_count: number
  used_by: string | null
  used_at: string | null
  is_used: boolean
  created_at: string
  expires_at: string | null
}

export interface PromoCodeListResponse {
  promo_codes: PromoCodeResponse[]
  total: number
}

export interface PromoCodeRedeemRequest {
  code: string
}

export interface PromoCodeRedeemResponse {
  message: string
  plan: string
  expires_at: string
}

// Admin metrics types
export interface AdminEngagementMetrics {
  total_users: number
  dau: number
  wau: number
  mau: number
  avg_entries_per_active_user_30d: number
}

export interface AdminMoodMetrics {
  avg_mood_all_time: number | null
  avg_mood_30d: number | null
  entries_with_mood_ratio: number
}

export interface AdminRevenueMetrics {
  total_revenue: number
  pro_month_users: number
  pro_year_users: number
  avg_month_payment: number
  avg_year_payment: number
  mrr_estimate: number
}

// Admin metrics history types
export interface AdminEngagementHistoryPoint {
  date: string
  dau: number
  new_users: number
}

export interface AdminMoodHistoryPoint {
  date: string
  avg_mood: number | null
  entries_with_mood: number
}

export interface AdminRevenueHistoryPoint {
  date: string
  total_revenue: number
  payments_count: number
}

export interface EntryCreateRequest {
  title?: string | null
  content: string
  tags?: string[] | null
  is_draft?: boolean
  created_at?: string | null
}

export interface EntryUpdateRequest {
  title?: string | null
  content?: string | null
  tags?: string[] | null
  is_draft?: boolean
}

export interface BatchEntryCreateRequest {
  entries: EntryCreateRequest[]
}

export interface BatchEntryResponse {
  created: EntryResponse[]
  failed: Array<{
    entry: {
      content: string
      created_at: string | null
    }
    error: string
  }>
  total_requested: number
  total_created: number
  total_failed: number
}

class ApiClient {
  private baseUrl: string
  private isRefreshing: boolean = false
  private refreshPromise: Promise<TokenResponse> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem('access_token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle 204 No Content (no response body)
      if (response.status === 204) {
        return undefined as T
      }

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
          const refreshTokenValue = localStorage.getItem('refresh_token')
          if (refreshTokenValue) {
            try {
              // Use a single refresh promise to prevent multiple simultaneous refreshes
              if (!this.isRefreshing) {
                this.isRefreshing = true
                this.refreshPromise = this.refreshToken(refreshTokenValue)
                  .finally(() => {
                    this.isRefreshing = false
                    this.refreshPromise = null
                  })
              }
              
              const newTokens = await this.refreshPromise!
              
              // Update tokens in localStorage (safe to do multiple times with same values)
              localStorage.setItem('access_token', newTokens.access_token)
              localStorage.setItem('refresh_token', newTokens.refresh_token)
              
              // Retry original request with new token
              const retryHeaders: Record<string, string> = {
                ...headers,
                'Authorization': `Bearer ${newTokens.access_token}`,
              }
              const retryResponse = await fetch(url, {
                ...options,
                headers: retryHeaders,
              })
              
              // Handle 204 No Content for retry
              if (retryResponse.status === 204) {
                return undefined as T
              }
              
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

  async getCurrentUser(): Promise<{ id: string; email: string; created_at: string; name?: string | null; picture?: string | null; is_admin?: boolean }> {
    return this.request<{ id: string; email: string; created_at: string; name?: string | null; picture?: string | null; is_admin?: boolean }>('/auth/me')
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

  async getWritingQuestion(n: number = 10, numQuestions: number = 3): Promise<{ questions: string[] }> {
    return this.request<{ questions: string[] }>(`/entries/question?n=${n}&num_questions=${numQuestions}`)
  }

  async createEntry(entryData: EntryCreateRequest): Promise<EntryResponse> {
    return this.request<EntryResponse>('/entries/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    })
  }

  async createEntriesBatch(batchData: BatchEntryCreateRequest): Promise<BatchEntryResponse> {
    return this.request<BatchEntryResponse>('/entries/batch', {
      method: 'POST',
      body: JSON.stringify(batchData),
    })
  }

  async createEntryFromAudio(
    audioFile: File,
    title?: string,
    tags?: string[]
  ): Promise<EntryResponse> {
    const url = `${this.baseUrl}/entries/from-audio`
    const token = localStorage.getItem('access_token')

    const formData = new FormData()
    formData.append('audio_file', audioFile)
    if (title) {
      formData.append('title', title)
    }
    if (tags && tags.length > 0) {
      tags.forEach(tag => formData.append('tags', tag))
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        const refreshTokenValue = localStorage.getItem('refresh_token')
        if (refreshTokenValue) {
          try {
            if (!this.isRefreshing) {
              this.isRefreshing = true
              this.refreshPromise = this.refreshToken(refreshTokenValue)
                .finally(() => {
                  this.isRefreshing = false
                  this.refreshPromise = null
                })
            }
            
            const newTokens = await this.refreshPromise!
            localStorage.setItem('access_token', newTokens.access_token)
            localStorage.setItem('refresh_token', newTokens.refresh_token)
            
            const retryHeaders: Record<string, string> = {
              ...headers,
              'Authorization': `Bearer ${newTokens.access_token}`,
            }
            const retryResponse = await fetch(url, {
              method: 'POST',
              headers: retryHeaders,
              body: formData,
            })
            
            if (!retryResponse.ok) {
              const error: ApiError = await retryResponse.json().catch(() => ({
                detail: `HTTP error! status: ${retryResponse.status}`,
              }))
              throw new Error(error.detail || 'An error occurred')
            }
            
            return retryResponse.json()
          } catch (refreshError) {
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

  async deleteEntry(id: string): Promise<void> {
    return this.request<void>(`/entries/${id}`, {
      method: 'DELETE',
    })
  }

  // Analytics endpoints
  async getMoodTrend(startDate?: string, endDate?: string, timezoneOffset?: number): Promise<Array<{ date: string; mood_rating: number; num_entries: number }>> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    if (timezoneOffset !== undefined) params.append('timezone_offset', timezoneOffset.toString())
    return this.request<Array<{ date: string; mood_rating: number; num_entries: number }>>(`/analytics/mood-trend?${params.toString()}`)
  }

  async getMainThemes(startDate?: string, endDate?: string): Promise<Array<{ tag: string; frequency: number; relative_percentage: number }>> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return this.request<Array<{ tag: string; frequency: number; relative_percentage: number }>>(`/analytics/main-themes?${params.toString()}`)
  }

  async getBestAndWorstDay(startDate?: string, endDate?: string): Promise<{
    best_entry: { id: string; mood_rating: number; created_at: string; tags: string[] | null };
    worst_entry: { id: string; mood_rating: number; created_at: string; tags: string[] | null };
  }> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return this.request<{
      best_entry: { id: string; mood_rating: number; created_at: string; tags: string[] | null };
      worst_entry: { id: string; mood_rating: number; created_at: string; tags: string[] | null };
    }>(`/analytics/best-and-worst-day?${params.toString()}`)
  }

  async compareCurrentAndPreviousMonth(): Promise<{
    current_mood_rating: number | null;
    previous_mood_rating: number | null;
    mood_rating_difference: number | null;
  }> {
    return this.request<{
      current_mood_rating: number | null;
      previous_mood_rating: number | null;
      mood_rating_difference: number | null;
    }>('/analytics/compare-current-and-previous-month-mood-rating')
  }

  // Insights endpoints
  async getMonthlyInsights(year?: number, month?: number): Promise<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string } | null> {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (month) params.append('month', month.toString())
    try {
      return await this.request<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }>(`/insights/monthly?${params.toString()}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('404')) {
        return null
      }
      throw error
    }
  }

  async generateMonthlyInsights(year?: number, month?: number): Promise<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }> {
    const params = new URLSearchParams()
    if (year) params.append('year', year.toString())
    if (month) params.append('month', month.toString())
    return this.request<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }>(`/insights/monthly?${params.toString()}`, {
      method: 'POST',
    })
  }

  async getWeeklyInsights(isoYear?: number, isoWeek?: number): Promise<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string } | null> {
    const params = new URLSearchParams()
    if (isoYear) params.append('iso_year', isoYear.toString())
    if (isoWeek) params.append('iso_week', isoWeek.toString())
    try {
      return await this.request<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }>(`/insights/weekly?${params.toString()}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('404')) {
        return null
      }
      throw error
    }
  }

  async generateWeeklyInsights(isoYear?: number, isoWeek?: number): Promise<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }> {
    const params = new URLSearchParams()
    if (isoYear) params.append('iso_year', isoYear.toString())
    if (isoWeek) params.append('iso_week', isoWeek.toString())
    return this.request<{ id: string; content: string; type: string; period_key: string; created_at: string; period_label?: string }>(`/insights/weekly?${params.toString()}`, {
      method: 'POST',
    })
  }

  async listInsights(type?: 'monthly' | 'weekly', page: number = 1, perPage: number = 100): Promise<{
    insights: Array<{
      id: string
      type: string
      period_key: string
      period_label: string
      created_at: string
    }>
    total: number
    page: number
    per_page: number
    total_pages: number
  }> {
    const params = new URLSearchParams()
    if (type) params.append('type', type)
    params.append('page', page.toString())
    params.append('per_page', perPage.toString())
    return this.request<{
      insights: Array<{
        id: string
        type: string
        period_key: string
        period_label: string
        created_at: string
      }>
      total: number
      page: number
      per_page: number
      total_pages: number
    }>(`/insights?${params.toString()}`)
  }

  async getUserCharacteristics(): Promise<UserCharacteristicResponse> {
    return this.request<UserCharacteristicResponse>('/auth/characteristics')
  }

  // Subscription endpoints
  async getPlans(): Promise<PlansListResponse> {
    return this.request<PlansListResponse>('/subscriptions/plans')
  }

  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('/subscriptions/current')
  }

  async startTrial(): Promise<StartTrialResponse> {
    return this.request<StartTrialResponse>('/subscriptions/start-trial', {
      method: 'POST',
    })
  }

  async subscribe(request: SubscribeRequest): Promise<SubscribeResponse> {
    return this.request<SubscribeResponse>('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>(`/subscriptions/payment/${paymentId}/status`)
  }

  // Promo code endpoints
  async createPromoCode(request: PromoCodeCreateRequest): Promise<PromoCodeResponse> {
    return this.request<PromoCodeResponse>('/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async listPromoCodes(includeUsed: boolean = true, limit?: number): Promise<PromoCodeListResponse> {
    const params = new URLSearchParams()
    params.append('include_used', includeUsed.toString())
    if (limit) params.append('limit', limit.toString())
    return this.request<PromoCodeListResponse>(`/admin/promo-codes?${params.toString()}`)
  }

  async deletePromoCode(promoCodeId: string): Promise<void> {
    await this.request<void>(`/admin/promo-codes/${promoCodeId}`, {
      method: 'DELETE',
    })
  }

  async redeemPromoCode(request: PromoCodeRedeemRequest): Promise<PromoCodeRedeemResponse> {
    return this.request<PromoCodeRedeemResponse>('/promo-codes/redeem', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Admin metrics endpoints
  async getAdminEngagementMetrics(): Promise<AdminEngagementMetrics> {
    return this.request<AdminEngagementMetrics>('/admin/metrics/engagement')
  }

  async getAdminMoodMetrics(): Promise<AdminMoodMetrics> {
    return this.request<AdminMoodMetrics>('/admin/metrics/mood')
  }

  async getAdminRevenueMetrics(): Promise<AdminRevenueMetrics> {
    return this.request<AdminRevenueMetrics>('/admin/metrics/revenue')
  }

  async getAdminEngagementHistory(days: number = 30): Promise<AdminEngagementHistoryPoint[]> {
    return this.request<AdminEngagementHistoryPoint[]>(
      `/admin/metrics/engagement/history?days=${days}`,
    )
  }

  async getAdminMoodHistory(days: number = 30): Promise<AdminMoodHistoryPoint[]> {
    return this.request<AdminMoodHistoryPoint[]>(
      `/admin/metrics/mood/history?days=${days}`,
    )
  }

  async getAdminRevenueHistory(days: number = 90): Promise<AdminRevenueHistoryPoint[]> {
    return this.request<AdminRevenueHistoryPoint[]>(
      `/admin/metrics/revenue/history?days=${days}`,
    )
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

