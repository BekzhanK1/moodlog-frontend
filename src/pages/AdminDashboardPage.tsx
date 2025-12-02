import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Title,
  Stack,
  Card,
  Group,
  Text,
  Button,
  Badge,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCrown, IconPlus, IconChartLine } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/dashboard/Navbar'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { user } = useAuth()

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard')
      return
    }
    // In the future we can load admin-wide metrics here
  }, [user, navigate])

  if (!user?.is_admin) {
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
      <Navbar userPicture={user?.picture} />
      <Container
        size="xl"
        style={{
          flex: 1,
          padding: isMobile ? '24px 16px' : '32px 24px',
        }}
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
                Админ панель
              </Title>
              <Text size="sm" c="dimmed">
                Управление системой и промокодами
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

          {/* Quick Actions */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            withBorder
            radius="lg"
            style={{
              background:
                'linear-gradient(135deg, rgba(148, 163, 184, 0.06), rgba(15, 23, 42, 0.35))',
              borderColor: 'var(--theme-border)',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.35)',
            }}
          >
            <Stack gap="md">
              <Box>
                <Text
                  size="xs"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--theme-text-secondary)',
                    marginBottom: 4,
                  }}
                >
                  Управление
                </Text>
                <Title order={3}>Быстрые действия</Title>
              </Box>

              <Group
                gap={isMobile ? 'sm' : 'md'}
                wrap="wrap"
              >
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate('/admin/promo-codes')}
                  variant="light"
                  radius="xl"
                  style={{
                    paddingInline: isMobile ? 16 : 20,
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                    boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)',
                  }}
                >
                  Промокоды
                </Button>
                <Button
                  leftSection={<IconChartLine size={16} />}
                  onClick={() => navigate('/admin/analytics')}
                  variant="subtle"
                  radius="xl"
                  style={{
                    paddingInline: isMobile ? 16 : 20,
                    border: '1px solid var(--theme-border)',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  }}
                >
                  Бизнес-аналитика
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

