import { Box, Text, Stack, Group, Grid, Button, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconChartLine } from '@tabler/icons-react'
import { Navbar } from '../components/dashboard/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { MoodCalendar } from '../components/analytics/MoodCalendar'
import { MoodTrendGraph } from '../components/analytics/MoodTrendGraph'
import { GeneralMoodCard } from '../components/analytics/GeneralMoodCard'
import { KeyMomentsCard } from '../components/analytics/KeyMomentsCard'
import { ThemesCard } from '../components/analytics/ThemesCard'
import { MonthlySummaryCard } from '../components/analytics/MonthlySummaryCard'
import { WeeklySummaryCard } from '../components/analytics/WeeklySummaryCard'

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
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Stack gap="md">
            <Group gap="md" align="center">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate('/dashboard')}
                style={{
                  color: 'var(--theme-text)',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                Назад
              </Button>
            </Group>
            <Group gap="md" align="center">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--theme-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--theme-bg)',
                }}
              >
                <IconChartLine size={24} />
              </Box>
              <Box>
                <Title
                  order={1}
                  style={{
                    fontSize: isMobile ? '28px' : '36px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Аналитика
                </Title>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  Анализ вашего настроения и записей
                </Text>
              </Box>
            </Group>
          </Stack>

          {/* Analytics Cards */}
          <Grid gutter={isMobile ? 'md' : 'lg'}>
            {/* First Row: General Mood takes full width */}
            <Grid.Col span={12}>
              <GeneralMoodCard />
            </Grid.Col>

            {/* Second Row: Calendar and Graph side by side */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <MoodCalendar />
            </Grid.Col>

            <Grid.Col span={isMobile ? 12 : 6}>
              <MoodTrendGraph />
            </Grid.Col>

            {/* Third Row: Key Moments and Themes side by side */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <KeyMomentsCard />
            </Grid.Col>

            <Grid.Col span={isMobile ? 12 : 6}>
              <ThemesCard />
            </Grid.Col>

            {/* Fourth Row: Weekly and Monthly Summaries side by side */}
            <Grid.Col span={isMobile ? 12 : 6}>
              <WeeklySummaryCard />
            </Grid.Col>

            <Grid.Col span={isMobile ? 12 : 6}>
              <MonthlySummaryCard />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </Box>
  )
}
