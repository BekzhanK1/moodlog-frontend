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
  NumberInput,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconPlus,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconTrash,
} from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, PromoCodeResponse } from '../utils/api'
import { AdminNavbar } from '../components/admin/AdminNavbar'
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
  const [maxUses, setMaxUses] = useState<number | ''>(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const handleDeletePromoCode = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      await apiClient.deletePromoCode(id)
      setPromoCodes((prev) => prev.filter((pc) => pc.id !== id))
      notifications.show({
        title: 'Удалено',
        message: 'Промокод удален',
        color: 'green',
      })
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось удалить промокод',
        color: 'red',
      })
    } finally {
      setDeletingId(null)
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
        max_uses: typeof maxUses === 'number' ? maxUses : undefined,
      })
      notifications.show({
        title: 'Успех!',
        message: 'Промокод создан',
        color: 'green',
      })
      setCreateModalOpened(false)
      setSelectedPlan(null)
      setCustomCode('')
      setMaxUses(1)
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
        background: 'radial-gradient(circle at top, rgba(56,189,248,0.18), transparent 55%), radial-gradient(circle at bottom, rgba(129,140,248,0.18), transparent 55%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AdminNavbar userPicture={user?.picture} />
      <Container
        size="xl"
        style={{
          flex: 1,
          padding: isMobile ? '24px 16px 32px' : '32px 24px 40px',
        }}
      >
        <Stack
          gap="lg"
          style={{
            maxWidth: 1120,
            margin: '0 auto',
          }}
        >
          {/* Header */}
          <Group justify="space-between" align="center" mb="xs">
            <Group gap="sm">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => navigate('/admin/dashboard')}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div>
                <Title order={2}>Управление промокодами</Title>
                <Text size="sm" c="dimmed">
                  Создавайте, раздавайте и контролируйте промокоды для Pro-подписок
                </Text>
              </div>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              radius="xl"
              variant={isMobile ? 'filled' : 'gradient'}
              gradient={{ from: 'cyan', to: 'indigo', deg: 135 }}
            >
              Создать промокод
            </Button>
          </Group>

          {/* Stats */}
          <Group
            gap="md"
            wrap="wrap"
          >
            <Card
              padding="md"
              radius="lg"
              withBorder
              style={{
                minWidth: 220,
                flex: '1 1 0',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Text size="sm" c="dimmed" mb={4}>
                Всего промокодов
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.length}
              </Text>
            </Card>
            <Card
              padding="md"
              radius="lg"
              withBorder
              style={{
                minWidth: 220,
                flex: '1 1 0',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Text size="sm" c="dimmed" mb={4}>
                Всего использований
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.reduce((sum, pc) => sum + pc.uses_count, 0)}
              </Text>
            </Card>
            <Card
              padding="md"
              radius="lg"
              withBorder
              style={{
                minWidth: 220,
                flex: '1 1 0',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Text size="sm" c="dimmed" mb={4}>
                Осталось использований
              </Text>
              <Text size="xl" fw={700}>
                {promoCodes.reduce(
                  (sum, pc) => sum + Math.max(pc.max_uses - pc.uses_count, 0),
                  0,
                )}
              </Text>
            </Card>
          </Group>

          {/* Promo Codes Table */}
          {loading ? (
            <Group justify="center" p="xl">
              <Loader />
            </Group>
          ) : promoCodes.length === 0 ? (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Нет промокодов"
              radius="lg"
              variant="light"
            >
              Создайте первый промокод, нажав кнопку "Создать промокод"
            </Alert>
          ) : (
            <Card
              padding={0}
              withBorder
              radius="lg"
              style={{
                overflow: 'hidden',
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <Table.ScrollContainer minWidth={isMobile ? 520 : 720}>
                <Table
                  verticalSpacing="md"
                  horizontalSpacing="md"
                  highlightOnHover
                  striped
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Код</Table.Th>
                      <Table.Th>План</Table.Th>
                      <Table.Th>Использования</Table.Th>
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
                          <Text size="sm">
                            {promoCode.uses_count} / {promoCode.max_uses}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {promoCode.is_used || promoCode.uses_count >= promoCode.max_uses ? (
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
                          <Group gap="xs">
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
                            <Tooltip label="Удалить промокод">
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                loading={deletingId === promoCode.id}
                                onClick={() => handleDeletePromoCode(promoCode.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
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
          setMaxUses(1)
        }}
        title="Создать промокод"
        centered
        radius="lg"
        overlayProps={{ blur: 6, opacity: 0.25 }}
      >
        <Stack gap="md">
          <Select
            label="План"
            placeholder="Выберите план"
            data={[
              { value: 'pro_month', label: 'Pro Месяц' },
              { value: 'pro_year', label: 'Pro Год' },
            ]}
            value={selectedPlan}
            onChange={(value) => setSelectedPlan(value as 'pro_month' | 'pro_year' | null)}
            required
            radius="xl"
            size="md"
          />
          <TextInput
            label="Код промокода"
            placeholder="Оставьте пустым для автогенерации"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            radius="xl"
            size="md"
          />
          <NumberInput
            label="Количество использований"
            min={1}
            value={maxUses}
            onChange={(value) => {
              if (value === '' || value === null) {
                setMaxUses('')
              } else {
                const num = typeof value === 'number' ? value : Number(value)
                setMaxUses(Number.isNaN(num) ? '' : num)
              }
            }}
            radius="xl"
            size="md"
          />
          <Text size="xs" c="dimmed">
            Промокод можно активировать только пользователям с планом Free или Trial. После активации
            выбранный Pro-план включится на их аккаунте, а количество использований уменьшается,
            пока не достигнет заданного лимита.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateModalOpened(false)
                setSelectedPlan(null)
                setCustomCode('')
                setMaxUses(1)
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreatePromoCode}
              loading={creating}
              leftSection={<IconPlus size={16} />}
              disabled={!selectedPlan}
              radius="xl"
            >
              Создать
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}

