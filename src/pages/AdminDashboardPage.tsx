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
  Button,
  Grid,
  Badge,
  Table,
  ActionIcon,
  Loader,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconCrown,
  IconGift,
  IconArrowRight,
  IconPlus,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, PromoCodeResponse } from '../utils/api'
import { Navbar } from '../components/dashboard/Navbar'
import { notifications } from '@mantine/notifications'
import { CopyButton, Tooltip } from '@mantine/core'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { user } = useAuth()
  const [promoCodes, setPromoCodes] = useState<PromoCodeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPromoCodes: 0,
    usedPromoCodes: 0,
    availablePromoCodes: 0,
  })

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard')
      return
    }
    if (user?.is_admin) {
      loadPromoCodes()
    }
  }, [user, navigate])

  const loadPromoCodes = async () => {
    setLoading(true)
    try {
      const response = await apiClient.listPromoCodes(true, 10) // Get latest 10
      setPromoCodes(response.promo_codes)
      setStats({
        totalPromoCodes: response.total,
        usedPromoCodes: response.promo_codes.filter((pc) => pc.is_used).length,
        availablePromoCodes: response.promo_codes.filter((pc) => !pc.is_used).length,
      })
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось загрузить данные',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указано'
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
      <Container size="xl" style={{ flex: 1, padding: isMobile ? '24px 16px' : '32px 24px' }}>
        <Stack gap="xl">
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

          {/* Stats Cards */}
          <Grid gutter="md">
            <Grid.Col span={isMobile ? 12 : 4}>
              <Card padding="lg" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Всего промокодов
                    </Text>
                    <IconGift size={20} style={{ color: 'var(--theme-text-secondary)' }} />
                  </Group>
                  <Text size="xl" fw={700}>
                    {stats.totalPromoCodes}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 4}>
              <Card padding="lg" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Использовано
                    </Text>
                    <IconCheck size={20} style={{ color: 'var(--theme-text-secondary)' }} />
                  </Group>
                  <Text size="xl" fw={700} c="red">
                    {stats.usedPromoCodes}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 4}>
              <Card padding="lg" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Доступно
                    </Text>
                    <IconGift size={20} style={{ color: 'var(--theme-text-secondary)' }} />
                  </Group>
                  <Text size="xl" fw={700} c="green">
                    {stats.availablePromoCodes}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Quick Actions */}
          <Card padding="lg" withBorder>
            <Stack gap="md">
              <Title order={3}>Быстрые действия</Title>
              <Group gap="md">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate('/admin/promo-codes')}
                  variant="light"
                >
                  Создать промокод
                </Button>
                <Button
                  leftSection={<IconGift size={16} />}
                  onClick={() => navigate('/admin/promo-codes')}
                  variant="subtle"
                >
                  Управление промокодами
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Recent Promo Codes */}
          <Card padding="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Title order={3}>Последние промокоды</Title>
                <Button
                  variant="subtle"
                  rightSection={<IconArrowRight size={16} />}
                  onClick={() => navigate('/admin/promo-codes')}
                >
                  Все промокоды
                </Button>
              </Group>
              {loading ? (
                <Group justify="center" p="xl">
                  <Loader />
                </Group>
              ) : promoCodes.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">
                  Нет промокодов. Создайте первый промокод!
                </Text>
              ) : (
                <Table.ScrollContainer minWidth={600}>
                  <Table verticalSpacing="md" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Код</Table.Th>
                        <Table.Th>План</Table.Th>
                        <Table.Th>Статус</Table.Th>
                        <Table.Th>Создан</Table.Th>
                        <Table.Th>Действия</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {promoCodes.map((promoCode) => (
                        <Table.Tr key={promoCode.id}>
                          <Table.Td>
                            <Group gap="xs">
                              <Text fw={600} style={{ fontFamily: 'monospace' }}>
                                {promoCode.code}
                              </Text>
                              <CopyButton value={promoCode.code}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? 'Скопировано' : 'Копировать'}>
                                    <ActionIcon variant="subtle" size="sm" onClick={copy}>
                                      {copied ? (
                                        <IconCheck size={14} />
                                      ) : (
                                        <IconCopy size={14} />
                                      )}
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={promoCode.plan === 'pro_month' ? 'blue' : 'yellow'}
                              variant="light"
                            >
                              {promoCode.plan === 'pro_month' ? 'Pro Месяц' : 'Pro Год'}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {promoCode.is_used ? (
                              <Badge color="red" variant="light">
                                Использован
                              </Badge>
                            ) : (
                              <Badge color="green" variant="light">
                                Доступен
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{formatDate(promoCode.created_at)}</Text>
                          </Table.Td>
                          <Table.Td>
                            <CopyButton value={promoCode.code}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Скопировано' : 'Копировать код'}>
                                  <ActionIcon variant="subtle" onClick={copy}>
                                    {copied ? (
                                      <IconCheck size={16} />
                                    ) : (
                                      <IconCopy size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

