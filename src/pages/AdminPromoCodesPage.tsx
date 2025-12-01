import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Title,
  Stack,
  Card,
  Button,
  TextInput,
  Select,
  Group,
  Text,
  Badge,
  Table,
  ActionIcon,
  Modal,
  Alert,
  Loader,
  CopyButton,
  Tooltip,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconPlus,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, PromoCodeResponse } from '../utils/api'
import { Navbar } from '../components/dashboard/Navbar'
import { notifications } from '@mantine/notifications'

export function AdminPromoCodesPage() {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { user } = useAuth()
  const [promoCodes, setPromoCodes] = useState<PromoCodeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro_month' | 'pro_year' | null>(null)
  const [customCode, setCustomCode] = useState('')
  const [creating, setCreating] = useState(false)

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
      const response = await apiClient.listPromoCodes(true, 100)
      setPromoCodes(response.promo_codes)
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось загрузить промокоды',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromoCode = async () => {
    if (!selectedPlan) {
      notifications.show({
        title: 'Ошибка',
        message: 'Выберите план',
        color: 'red',
      })
      return
    }

    setCreating(true)
    try {
      await apiClient.createPromoCode({
        plan: selectedPlan,
        code: customCode.trim() || undefined,
      })
      notifications.show({
        title: 'Успех!',
        message: 'Промокод создан',
        color: 'green',
      })
      setCreateModalOpened(false)
      setSelectedPlan(null)
      setCustomCode('')
      await loadPromoCodes()
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось создать промокод',
        color: 'red',
      })
    } finally {
      setCreating(false)
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
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Group gap="md">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => navigate('/admin/dashboard')}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <Title order={2}>Управление промокодами</Title>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
            >
              Создать промокод
            </Button>
          </Group>

          {/* Stats */}
          <Group gap="md">
            <Card padding="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>
                Всего промокодов
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.length}
              </Text>
            </Card>
            <Card padding="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>
                Использовано
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.filter((pc) => pc.is_used).length}
              </Text>
            </Card>
            <Card padding="md" withBorder>
              <Text size="sm" c="dimmed" mb={4}>
                Доступно
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.filter((pc) => !pc.is_used).length}
              </Text>
            </Card>
          </Group>

          {/* Promo Codes Table */}
          {loading ? (
            <Group justify="center" p="xl">
              <Loader />
            </Group>
          ) : promoCodes.length === 0 ? (
            <Alert icon={<IconAlertCircle size={16} />} title="Нет промокодов">
              Создайте первый промокод, нажав кнопку "Создать промокод"
            </Alert>
          ) : (
            <Card padding={0} withBorder>
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="md" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Код</Table.Th>
                      <Table.Th>План</Table.Th>
                      <Table.Th>Статус</Table.Th>
                      <Table.Th>Создан</Table.Th>
                      <Table.Th>Использован</Table.Th>
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
                                  <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    onClick={copy}
                                  >
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
                          <Text size="sm">
                            {promoCode.used_at ? formatDate(promoCode.used_at) : '-'}
                          </Text>
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
            </Card>
          )}
        </Stack>
      </Container>

      {/* Create Promo Code Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false)
          setSelectedPlan(null)
          setCustomCode('')
        }}
        title="Создать промокод"
        centered
      >
        <Stack gap="md">
          <Select
            label="Выберите план"
            placeholder="Выберите план для промокода"
            data={[
              { value: 'pro_month', label: 'Pro Месяц' },
              { value: 'pro_year', label: 'Pro Год' },
            ]}
            value={selectedPlan}
            onChange={(value) => setSelectedPlan(value as 'pro_month' | 'pro_year' | null)}
            required
          />
          <TextInput
            label="Промокод (необязательно)"
            placeholder="Оставьте пустым для автогенерации"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            description="Минимум 6 символов. Если не указано, будет сгенерирован автоматически."
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateModalOpened(false)
                setSelectedPlan(null)
                setCustomCode('')
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreatePromoCode}
              loading={creating}
              leftSection={<IconPlus size={16} />}
              disabled={!selectedPlan}
            >
              Создать
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}

