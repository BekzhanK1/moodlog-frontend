import { useState, useEffect } from 'react'
import {
  Modal,
  Drawer,
  Stack,
  Text,
  Button,
  Badge,
  Group,
  TextInput,
  Loader,
  Box,
  Card,
  Title,
  SimpleGrid,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import {
  IconCrown,
  IconGift,
  IconCheck,
  IconSparkles,
  IconRocket,
  IconInfinity,
  IconX,
} from '@tabler/icons-react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { apiClient } from '../../utils/api'
import { notifications } from '@mantine/notifications'

interface SubscriptionMenuProps {
  opened: boolean
  onClose: () => void
  initialTab?: 'overview' | 'redeem' | 'upgrade'
}

const PRIMARY_COLOR = '#FDB500'

export function SubscriptionMenu({ opened, onClose, initialTab = 'overview' }: SubscriptionMenuProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { subscription, refreshSubscription } = useSubscription()
  const [activeTab, setActiveTab] = useState<'overview' | 'redeem' | 'upgrade'>(initialTab)
  const [promoCode, setPromoCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    if (opened) {
      setActiveTab(initialTab)
      if (initialTab === 'upgrade') {
        loadPlans()
      }
    }
  }, [opened, initialTab])

  const loadPlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await apiClient.getPlans()
      setPlans(response.plans.filter((p) => p.id !== 'free' && p.id !== 'trial'))
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить планы',
        color: 'red',
      })
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleRedeemPromoCode = async () => {
    if (!promoCode.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Введите промокод',
        color: 'red',
      })
      return
    }

    setRedeeming(true)
    try {
      const response = await apiClient.redeemPromoCode({ code: promoCode.trim() })
      notifications.show({
        title: 'Успех!',
        message: response.message,
        color: 'green',
        icon: <IconCheck size={16} />,
      })
      setPromoCode('')
      setActiveTab('overview')
      await refreshSubscription()
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось активировать промокод',
        color: 'red',
      })
    } finally {
      setRedeeming(false)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await apiClient.subscribe({ plan: planId as 'pro_month' | 'pro_year' })
      window.location.href = response.payment_url
    } catch (error: any) {
      notifications.show({
        title: 'Ошибка',
        message: error.message || 'Не удалось инициировать оплату',
        color: 'red',
      })
    }
  }

  const getPlanBadge = () => {
    if (!subscription) return null

    if (subscription.plan === 'free') {
      return (
        <Badge size="md" variant="light" radius="md" style={{ color: 'var(--theme-text-secondary)' }}>
          Free
        </Badge>
      )
    }

    if (subscription.plan === 'trial') {
      return (
        <Badge
          size="md"
          variant="light"
          radius="md"
          leftSection={<IconSparkles size={12} />}
          style={{ color: PRIMARY_COLOR }}
        >
          Trial
        </Badge>
      )
    }

    if (subscription.plan === 'pro_month' || subscription.plan === 'pro_year') {
      return (
        <Badge
          size="md"
          variant="light"
          radius="md"
          leftSection={<IconCrown size={12} />}
          style={{ color: PRIMARY_COLOR }}
        >
          Pro
        </Badge>
      )
    }

    return null
  }

  const proFeatures = [
    { label: 'Основные темы и триггеры', icon: <IconCheck size={16} /> },
    { label: 'Еженедельные AI инсайты', icon: <IconCheck size={16} /> },
    { label: 'Ежемесячные AI инсайты', icon: <IconCheck size={16} /> },
    { label: 'Голосовые записи', icon: <IconCheck size={16} /> },
    { label: 'Безлимитные AI вопросы', icon: <IconInfinity size={16} /> },
  ]

  const content = (
    <Stack gap={isMobile ? "lg" : "xl"}>
      {/* Plan Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Current Plan Card */}
          <Card
            padding={isMobile ? "md" : "lg"}
            radius="md"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${PRIMARY_COLOR} 8%, transparent) 0%, color-mix(in srgb, ${PRIMARY_COLOR} 4%, transparent) 100%)`,
              border: `1px solid color-mix(in srgb, ${PRIMARY_COLOR} 15%, transparent)`,
            }}
          >
            <Group justify="space-between" align="flex-start" mb="md">
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={500} mb={4} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Текущий план
                </Text>
                <Text size={isMobile ? "lg" : "xl"} fw={700} mb={4} style={{ color: 'var(--theme-text)' }}>
                  {subscription?.plan_name || 'Free'}
                </Text>
                {subscription?.expires_at && (
                  <Text size="sm" c="dimmed">
                    До {new Date(subscription.expires_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </Text>
                )}
              </Box>
              {getPlanBadge()}
            </Group>
          </Card>

          {/* Actions */}
          <Stack gap="sm">
            {subscription?.plan === 'free' && !subscription.trial_used && (
              <Button
                variant="light"
                size={isMobile ? "md" : "lg"}
                radius="md"
                leftSection={<IconSparkles size={18} />}
                onClick={async () => {
                  try {
                    await apiClient.startTrial()
                    notifications.show({
                      title: 'Успех!',
                      message: 'Пробный период активирован',
                      color: 'green',
                    })
                    await refreshSubscription()
                  } catch (error: any) {
                    notifications.show({
                      title: 'Ошибка',
                      message: error.message || 'Не удалось активировать пробный период',
                      color: 'red',
                    })
                  }
                }}
                fullWidth
                style={{ 
                  color: PRIMARY_COLOR, 
                  borderColor: PRIMARY_COLOR,
                  fontWeight: 600,
                }}
              >
                Начать пробный период
              </Button>
            )}
            {(subscription?.plan === 'free' || subscription?.plan === 'trial') && (
              <Button
                size={isMobile ? "md" : "lg"}
                radius="md"
                leftSection={<IconRocket size={18} />}
                onClick={() => {
                  setActiveTab('upgrade')
                  loadPlans()
                }}
                fullWidth
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                Перейти на Pro
              </Button>
            )}
            <Button
              variant="subtle"
              size={isMobile ? "sm" : "md"}
              radius="md"
              leftSection={<IconGift size={16} />}
              onClick={() => setActiveTab('redeem')}
              fullWidth
            >
              Активировать промокод
            </Button>
          </Stack>
        </>
      )}

      {/* Redeem Promo Code */}
      {activeTab === 'redeem' && (
        <Stack gap="lg">
          <Box>
            <Group gap="xs" mb={8}>
              <IconGift size={24} style={{ color: PRIMARY_COLOR }} />
              <Title order={3} style={{ color: 'var(--theme-text)' }}>
                Активация промокода
              </Title>
            </Group>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              Введите промокод, чтобы получить доступ к Pro функциям
            </Text>
          </Box>
          
          <Card
            padding={isMobile ? "md" : "lg"}
            radius="md"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${PRIMARY_COLOR} 8%, transparent) 0%, color-mix(in srgb, ${PRIMARY_COLOR} 4%, transparent) 100%)`,
              border: `1px solid color-mix(in srgb, ${PRIMARY_COLOR} 15%, transparent)`,
            }}
          >
            <Stack gap="md">
              <TextInput
                placeholder="ВВЕДИТЕ ПРОМОКОД"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                leftSection={<IconGift size={18} style={{ color: PRIMARY_COLOR }} />}
                size={isMobile ? "md" : "lg"}
                radius="md"
                styles={{
                  input: {
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    borderColor: 'var(--theme-border)',
                    '&:focus': {
                      borderColor: PRIMARY_COLOR,
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              <Button
                onClick={handleRedeemPromoCode}
                loading={redeeming}
                leftSection={<IconGift size={18} />}
                size={isMobile ? "md" : "lg"}
                radius="md"
                fullWidth
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  color: '#000',
                  fontWeight: 600,
                }}
              >
                Активировать
              </Button>
            </Stack>
          </Card>

          <Button 
            variant="subtle" 
            onClick={() => setActiveTab('overview')} 
            radius="md"
            fullWidth
            leftSection={<IconX size={16} />}
          >
            Назад
          </Button>
        </Stack>
      )}

      {/* Upgrade Plans */}
      {activeTab === 'upgrade' && (
        <Stack gap="lg">
          <Box>
            <Group gap="xs" mb={8}>
              <IconCrown size={28} style={{ color: PRIMARY_COLOR }} />
              <Title order={2} style={{ color: 'var(--theme-text)' }}>
                Откройте все возможности
              </Title>
            </Group>
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              Получите полный доступ к аналитике, AI-инсайтам и эксклюзивным функциям
            </Text>
          </Box>

          {/* Pro Features Highlight */}
          <Card
            padding={isMobile ? "md" : "lg"}
            radius="md"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${PRIMARY_COLOR} 10%, transparent) 0%, color-mix(in srgb, ${PRIMARY_COLOR} 5%, transparent) 100%)`,
              border: `1px solid color-mix(in srgb, ${PRIMARY_COLOR} 20%, transparent)`,
            }}
          >
            <Stack gap="sm">
              {proFeatures.map((feature, index) => (
                <Group key={index} gap="sm" align="center">
                  <Box 
                    style={{ 
                      color: PRIMARY_COLOR,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Text size={isMobile ? "sm" : "md"} fw={500} style={{ color: 'var(--theme-text)' }}>
                    {feature.label}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Card>

          {loadingPlans ? (
            <Group justify="center" p="xl">
              <Loader size="lg" color={PRIMARY_COLOR} />
            </Group>
          ) : (
            <Box>
              <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? "md" : "lg"}>
                {plans.map((plan) => {
                  const isYearly = plan.id === 'pro_year'
                  // Find monthly plan price for calculation
                  const monthlyPlan = plans.find(p => p.id === 'pro_month')
                  const monthlyPlanPrice = monthlyPlan?.price_monthly || 1990
                  const monthlyPrice = isYearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly
                  const originalYearlyPrice = monthlyPlanPrice * 12 // 1990 * 12 = 23880
                  const savings = isYearly ? Math.round(originalYearlyPrice - plan.price_yearly) : 0

                  return (
                    <Card
                      key={plan.id}
                      padding={isMobile ? "md" : "lg"}
                      radius="md"
                      withBorder
                      style={{
                        background: isYearly 
                          ? `linear-gradient(135deg, color-mix(in srgb, ${PRIMARY_COLOR} 5%, transparent) 0%, var(--theme-surface) 100%)`
                          : 'var(--theme-surface)',
                        border: isYearly ? `2px solid ${PRIMARY_COLOR}` : '1px solid var(--theme-border)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        ...(isYearly && { paddingTop: isMobile ? '20px' : '28px' }),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = PRIMARY_COLOR
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = `0 12px 32px color-mix(in srgb, ${PRIMARY_COLOR} 25%, transparent)`
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isYearly ? PRIMARY_COLOR : 'var(--theme-border)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {isYearly && (
                        <Badge
                          size="sm"
                          radius="md"
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            right: isMobile ? '12px' : '16px',
                            backgroundColor: PRIMARY_COLOR,
                            color: '#000',
                            fontWeight: 700,
                            zIndex: 10,
                            padding: '4px 12px',
                          }}
                        >
                          Выгодно
                        </Badge>
                      )}
                      <Stack gap={isMobile ? "sm" : "md"} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box>
                          <Text 
                            size="xs" 
                            c="dimmed" 
                            mb={6}
                            fw={500}
                            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                          >
                            {isYearly ? 'Годовая подписка' : 'Месячная подписка'}
                          </Text>
                          <Group gap="xs" align="baseline" mb={4}>
                            <Text size={isMobile ? "xl" : "2xl"} fw={700} style={{ color: 'var(--theme-text)' }}>
                              {isYearly ? plan.price_yearly : plan.price_monthly} ₸
                            </Text>
                            {isYearly && (
                              <Text size="sm" c="dimmed" td="line-through" style={{ opacity: 0.6 }}>
                                {originalYearlyPrice} ₸
                              </Text>
                            )}
                          </Group>
                          <Group gap="xs" align="center">
                            <Text size="sm" c="dimmed" fw={500}>
                              {monthlyPrice} ₸/мес
                            </Text>
                            {isYearly && savings > 0 && (
                              <Badge
                                size="sm"
                                variant="light"
                                radius="sm"
                                style={{
                                  backgroundColor: 'color-mix(in srgb, #22c55e 20%, transparent)',
                                  color: '#16a34a',
                                  fontWeight: 600,
                                }}
                              >
                                Экономия {savings} ₸
                              </Badge>
                            )}
                          </Group>
                        </Box>
                        <Button
                          fullWidth
                          size={isMobile ? "md" : "lg"}
                          radius="md"
                          onClick={() => handleSubscribe(plan.id)}
                          leftSection={isYearly ? <IconRocket size={18} /> : <IconCrown size={18} />}
                          style={{
                            backgroundColor: PRIMARY_COLOR,
                            color: '#000',
                            fontWeight: 600,
                            marginTop: 'auto',
                          }}
                        >
                          {isYearly ? 'Начать год' : 'Начать месяц'}
                        </Button>
                      </Stack>
                    </Card>
                  )
                })}
              </SimpleGrid>
            </Box>
          )}
          <Button 
            variant="subtle" 
            onClick={() => setActiveTab('overview')} 
            radius="md" 
            fullWidth
            leftSection={<IconX size={16} />}
            size={isMobile ? "sm" : "md"}
          >
            Назад
          </Button>
        </Stack>
      )}
    </Stack>
  )

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="xs" align="center">
            <IconCrown size={20} style={{ color: PRIMARY_COLOR }} />
            <Text fw={700} size="lg" style={{ color: 'var(--theme-text)' }}>
              Управление подпиской
            </Text>
          </Group>
        }
        position="bottom"
        size="90%"
        styles={{
          content: {
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            backgroundColor: 'var(--theme-bg)',
          },
          header: {
            borderBottom: '1px solid var(--theme-border)',
            padding: '20px',
            backgroundColor: 'var(--theme-bg)',
          },
          body: {
            padding: '20px',
            paddingTop: '24px',
          },
        }}
      >
        {content}
      </Drawer>
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs" align="center">
          <IconCrown size={24} style={{ color: PRIMARY_COLOR }} />
          <Text fw={700} size="xl" style={{ color: 'var(--theme-text)' }}>
            Управление подпиской
          </Text>
        </Group>
      }
      size="700px"
      centered
      radius="md"
      styles={{
        content: {
          backgroundColor: 'var(--theme-bg)',
          border: '1px solid var(--theme-border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        },
        header: {
          borderBottom: '1px solid var(--theme-border)',
          padding: '24px',
          backgroundColor: 'var(--theme-bg)',
        },
        body: {
          padding: '32px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      {content}
    </Modal>
  )
}
