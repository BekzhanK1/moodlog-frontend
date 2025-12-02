import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Title,
  Stack,
  Card,
  Group,
  Text,
  Badge,
  Grid,
  Loader,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCrown, IconChartLine, IconMoodSmile, IconCurrencyDollar } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/dashboard/Navbar'
import {
  apiClient,
  AdminEngagementMetrics,
  AdminMoodMetrics,
  AdminRevenueMetrics,
  AdminEngagementHistoryPoint,
  AdminMoodHistoryPoint,
  AdminRevenueHistoryPoint,
} from '../utils/api'

export function AdminAnalyticsPage() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { user } = useAuth()

  const [engagement, setEngagement] = useState<AdminEngagementMetrics | null>(null)
  const [mood, setMood] = useState<AdminMoodMetrics | null>(null)
  const [revenue, setRevenue] = useState<AdminRevenueMetrics | null>(null)
  const [engagementHistory, setEngagementHistory] = useState<AdminEngagementHistoryPoint[]>([])
  const [moodHistory, setMoodHistory] = useState<AdminMoodHistoryPoint[]>([])
  const [revenueHistory, setRevenueHistory] = useState<AdminRevenueHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard')
      return
    }

    const loadMetrics = async () => {
      try {
        const [eng, moodRes, rev, engHist, moodHist, revHist] = await Promise.all([
          apiClient.getAdminEngagementMetrics(),
          apiClient.getAdminMoodMetrics(),
          apiClient.getAdminRevenueMetrics(),
          apiClient.getAdminEngagementHistory(30),
          apiClient.getAdminMoodHistory(30),
          apiClient.getAdminRevenueHistory(30),
        ])
        setEngagement(eng)
        setMood(moodRes)
        setRevenue(rev)
        setEngagementHistory(engHist)
        setMoodHistory(moodHist)
        setRevenueHistory(revHist)
      } finally {
        setLoading(false)
      }
    }

    if (user?.is_admin) {
      loadMetrics()
    }
  }, [user, navigate])

  if (!user?.is_admin) {
    return null
  }

  const maxDau =
    engagementHistory.length > 0
      ? Math.max(...engagementHistory.map((p) => p.dau))
      : 0
  const maxNewUsers =
    engagementHistory.length > 0
      ? Math.max(...engagementHistory.map((p) => p.new_users))
      : 0


  const maxDailyRevenue =
    revenueHistory.length > 0
      ? Math.max(...revenueHistory.map((p) => p.total_revenue))
      : 0

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar userPicture={user?.picture} />
      <Container
        size="xl"
        style={{ flex: 1, padding: isMobile ? '24px 16px' : '32px 24px' }}
      >
        <Stack
          gap="xl"
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <Group justify="space-between" align="center">
            <Box>
              <Title order={1} mb="xs">
                Бизнес-аналитика
              </Title>
              <Text size="sm" c="dimmed">
                Ключевые метрики роста, вовлеченности и выручки
              </Text>
            </Box>
            <Badge
              color="yellow"
              variant="light"
              size="lg"
              leftSection={<IconCrown size={16} />}
            >
              Администратор
            </Badge>
          </Group>

          {loading ? (
            <Group justify="center" py="xl">
              <Loader />
            </Group>
          ) : (
            <Stack gap="xl">
              {/* Engagement */}
              <Card
                padding={isMobile ? 'md' : 'lg'}
                withBorder
                radius="lg"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <Stack gap="md">
                  <Group gap="xs" align="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconChartLine size={18} />
                    </Box>
                    <Title order={3}>Вовлеченность</Title>
                  </Group>
                  <Grid gutter="md">
                    <Grid.Col span={isMobile ? 12 : 3}>
                      <Text size="sm" c="dimmed">
                        Всего пользователей
                      </Text>
                      <Text size="xl" fw={700}>
                        {engagement?.total_users ?? '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 3}>
                      <Text size="sm" c="dimmed">
                        DAU
                      </Text>
                      <Text size="xl" fw={700}>
                        {engagement?.dau ?? '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 3}>
                      <Text size="sm" c="dimmed">
                        WAU (7д)
                      </Text>
                      <Text size="xl" fw={700}>
                        {engagement?.wau ?? '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 3}>
                      <Text size="sm" c="dimmed">
                        MAU (30д)
                      </Text>
                      <Text size="xl" fw={700}>
                        {engagement?.mau ?? '—'}
                      </Text>
                    </Grid.Col>
                  </Grid>
                  <Text size="sm" c="dimmed">
                    Среднее число записей на активного пользователя за 30 дней:{' '}
                    <Text component="span" fw={600}>
                      {engagement
                        ? engagement.avg_entries_per_active_user_30d.toFixed(1)
                        : '—'}
                    </Text>
                  </Text>

                  {/* Mini history chart for DAU / new users */}
                  {engagementHistory.length > 0 && maxDau > 0 && (
                    <Box
                      style={{
                        marginTop: 12,
                        paddingTop: 8,
                        borderTop: '1px solid var(--theme-border)',
                      }}
                    >
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" c="dimmed">
                          Активность за 30 дней
                        </Text>
                        <Text size="xs" c="dimmed">
                          DAU / новые пользователи
                        </Text>
                      </Group>
                      <Group gap={4} align="flex-end" style={{ height: 64, overflow: 'hidden' }}>
                        {engagementHistory.map((point) => {
                          const dauHeight =
                            maxDau > 0 ? Math.max((point.dau / maxDau) * 100, 8) : 0
                          const newUsersHeight =
                            maxNewUsers > 0
                              ? Math.max((point.new_users / maxNewUsers) * 100, 4)
                              : 0
                          return (
                            <Box
                              key={point.date}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                height: '100%',
                                width: 6,
                                gap: 2,
                              }}
                              title={`${point.date}: DAU ${point.dau}, новые ${point.new_users}`}
                            >
                              <Box
                                style={{
                                  width: '100%',
                                  borderRadius: 999,
                                  background:
                                    'linear-gradient(to top, rgba(56,189,248,0.8), rgba(56,189,248,0.2))',
                                  height: `${dauHeight}%`,
                                }}
                              />
                              {maxNewUsers > 0 && (
                                <Box
                                  style={{
                                    width: '100%',
                                    borderRadius: 999,
                                    backgroundColor: 'rgba(190, 242, 100, 0.7)',
                                    height: `${newUsersHeight}%`,
                                  }}
                                />
                              )}
                            </Box>
                          )
                        })}
                      </Group>
                    </Box>
                  )}
                </Stack>
              </Card>

              {/* Mood / outcomes */}
              <Card
                padding={isMobile ? 'md' : 'lg'}
                withBorder
                radius="lg"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <Stack gap="md">
                  <Group gap="xs" align="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconMoodSmile size={18} />
                    </Box>
                    <Title order={3}>Настроение и результаты</Title>
                  </Group>
                  <Grid gutter="md">
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Среднее настроение (all time)
                      </Text>
                      <Text size="xl" fw={700}>
                        {mood?.avg_mood_all_time != null
                          ? mood.avg_mood_all_time.toFixed(2)
                          : '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Среднее настроение (30д)
                      </Text>
                      <Text size="xl" fw={700}>
                        {mood?.avg_mood_30d != null
                          ? mood.avg_mood_30d.toFixed(2)
                          : '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Доля записей с анализом настроения
                      </Text>
                      <Text size="xl" fw={700}>
                        {mood
                          ? `${Math.round(mood.entries_with_mood_ratio * 100)}%`
                          : '—'}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  {/* Mini history chart for average mood */}
                  {moodHistory.length > 0 && (
                    <Box
                      style={{
                        marginTop: 12,
                        paddingTop: 8,
                        borderTop: '1px solid var(--theme-border)',
                      }}
                    >
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" c="dimmed">
                          Среднее настроение за 30 дней
                        </Text>
                        <Text size="xs" c="dimmed">
                          -2 … +2
                        </Text>
                      </Group>
                      <Group gap={4} align="flex-end" style={{ height: 64, overflow: 'hidden' }}>
                        {moodHistory.map((point) => {
                          const moodValue = point.avg_mood ?? 0
                          // scale -2..+2 to 0..1
                          const normalized = (moodValue + 2) / 4
                          const barHeight = Math.max(normalized * 100, 4)
                          return (
                            <Box
                              key={point.date}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                height: '100%',
                                width: 6,
                              }}
                              title={`${point.date}: mood ${
                                point.avg_mood != null ? point.avg_mood.toFixed(2) : '—'
                              }`}
                            >
                              <Box
                                style={{
                                  width: '100%',
                                  borderRadius: 999,
                                  background:
                                    moodValue >= 0
                                      ? 'linear-gradient(to top, rgba(34,197,94,0.9), rgba(74,222,128,0.3))'
                                      : 'linear-gradient(to top, rgba(248,113,113,0.9), rgba(252,165,165,0.3))',
                                  opacity: point.avg_mood == null ? 0.3 : 1,
                                  height: `${barHeight}%`,
                                }}
                              />
                            </Box>
                          )
                        })}
                      </Group>
                    </Box>
                  )}
                </Stack>
              </Card>

              {/* Revenue */}
              <Card
                padding={isMobile ? 'md' : 'lg'}
                withBorder
                radius="lg"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <Stack gap="md">
                  <Group gap="xs" align="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        backgroundColor: 'rgba(251, 191, 36, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconCurrencyDollar size={18} />
                    </Box>
                    <Title order={3}>Выручка</Title>
                  </Group>
                  <Grid gutter="md">
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Всего выручка (KZT)
                      </Text>
                      <Text size="xl" fw={700}>
                        {revenue ? Math.round(revenue.total_revenue).toLocaleString('ru-RU') : '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Оценка MRR (KZT)
                      </Text>
                      <Text size="xl" fw={700}>
                        {revenue ? Math.round(revenue.mrr_estimate).toLocaleString('ru-RU') : '—'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 4}>
                      <Text size="sm" c="dimmed">
                        Pro пользователи (месяц / год)
                      </Text>
                      <Text size="xl" fw={700}>
                        {revenue
                          ? `${revenue.pro_month_users} / ${revenue.pro_year_users}`
                          : '—'}
                      </Text>
                    </Grid.Col>
                  </Grid>

                  {/* Mini history chart for daily revenue */}
                  {revenueHistory.length > 0 && maxDailyRevenue > 0 && (
                    <Box
                      style={{
                        marginTop: 12,
                        paddingTop: 8,
                        borderTop: '1px solid var(--theme-border)',
                      }}
                    >
                      <Group justify="space-between" mb={4}>
                        <Text size="xs" c="dimmed">
                          Дневная выручка (30 дней)
                        </Text>
                      </Group>
                      <Group gap={4} align="flex-end" style={{ height: 64, overflow: 'hidden' }}>
                        {revenueHistory.map((point) => {
                          const height =
                            maxDailyRevenue > 0
                              ? Math.max((point.total_revenue / maxDailyRevenue) * 100, 4)
                              : 0
                          return (
                            <Box
                              key={point.date}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                height: '100%',
                                width: 6,
                              }}
                              title={`${point.date}: ${Math.round(
                                point.total_revenue,
                              ).toLocaleString('ru-RU')} KZT`}
                            >
                              <Box
                                style={{
                                  width: '100%',
                                  borderRadius: 999,
                                  background:
                                    'linear-gradient(to top, rgba(251,191,36,0.9), rgba(252,211,77,0.3))',
                                  height: `${height}%`,
                                }}
                              />
                            </Box>
                          )
                        })}
                      </Group>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  )
}


