import { Box, Text, Stack, Card, Group, Grid } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/dashboard/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { MoodCalendar } from '../components/analytics/MoodCalendar'
import { MoodTrendGraph } from '../components/analytics/MoodTrendGraph'
import { GeneralMoodCard } from '../components/analytics/GeneralMoodCard'
import { KeyMomentsCard } from '../components/analytics/KeyMomentsCard'
import { ThemesCard } from '../components/analytics/ThemesCard'
import { MonthlySummaryCard } from '../components/analytics/MonthlySummaryCard'

export function AnalyticsPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
  }, [isAuthenticated, authLoading, navigate])

  if (authLoading) {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--theme-bg)',
        }}
      >
        <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка...</Text>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar userPicture={user?.picture || null} />
      
      <Box
        style={{
          flex: 1,
          padding: isMobile ? '20px 16px' : '40px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Text
            style={{
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: 400,
              color: 'var(--theme-text)',
              marginBottom: '8px',
            }}
          >
            Аналитика
          </Text>

          {/* Analytics Cards */}
          <Grid gutter={isMobile ? 'md' : 'lg'}>
            {/* General Mood Card */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <GeneralMoodCard />
            </Grid.Col>

            {/* Mood Calendar */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <MoodCalendar />
            </Grid.Col>

            {/* Mood Trend Graph */}
            <Grid.Col span={12}>
              <MoodTrendGraph />
            </Grid.Col>

            {/* Key Moments */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <KeyMomentsCard />
            </Grid.Col>

            {/* Themes and Triggers */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <ThemesCard />
            </Grid.Col>

            {/* Monthly Summary */}
            <Grid.Col span={12}>
              <MonthlySummaryCard />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </Box>
  )
}
