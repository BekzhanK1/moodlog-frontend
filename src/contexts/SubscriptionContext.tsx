import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient, SubscriptionResponse } from '../utils/api'

interface SubscriptionContextType {
  subscription: SubscriptionResponse | null
  isLoading: boolean
  refreshSubscription: () => Promise<void>
  canUseFeature: (feature: string) => boolean
  getAiQuestionsLimit: () => number | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = async () => {
    try {
      const subData = await apiClient.getCurrentSubscription()
      setSubscription(subData)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const refreshSubscription = async () => {
    await fetchSubscription()
  }

  const canUseFeature = (feature: string): boolean => {
    if (!subscription || !subscription.is_active) {
      return false
    }
    return subscription.features[feature as keyof typeof subscription.features] === true
  }

  const getAiQuestionsLimit = (): number | null => {
    if (!subscription || !subscription.is_active) {
      return 5 // Free plan limit
    }
    return subscription.features.ai_questions_per_day
  }

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        refreshSubscription,
        canUseFeature,
        getAiQuestionsLimit,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}





