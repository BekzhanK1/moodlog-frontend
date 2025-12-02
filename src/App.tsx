import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { TutorialPage } from './pages/TutorialPage'
import { AdminPromoCodesPage } from './pages/AdminPromoCodesPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WeatherEffectComponent } from './components/WeatherEffect'
import { getWeatherEffect } from './utils/weatherEffects'
import { useState, useEffect } from 'react'

function AppContent() {
  const { mantineTheme } = useTheme()
  const [weatherEffect, setWeatherEffect] = useState(getWeatherEffect())

  useEffect(() => {
    // Listen for weather effect changes from settings
    const handleEffectChange = (e: CustomEvent) => {
      setWeatherEffect(e.detail)
    }

    // Listen for storage changes (when settings are changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'weather_effect' && e.newValue) {
        setWeatherEffect(e.newValue as any)
      }
    }

    window.addEventListener('weatherEffectChanged', handleEffectChange as EventListener)
    window.addEventListener('storage', handleStorageChange)

    // Also check periodically for changes in the same tab
    const interval = setInterval(() => {
      const newEffect = getWeatherEffect()
      if (newEffect !== weatherEffect) {
        setWeatherEffect(newEffect)
      }
    }, 500)

    return () => {
      window.removeEventListener('weatherEffectChanged', handleEffectChange as EventListener)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [weatherEffect])

  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <WeatherEffectComponent effect={weatherEffect} />
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/admin/promo-codes" element={<AdminPromoCodesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
