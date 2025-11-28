import { Box, Container, Title, Stack, Group, Button, Text, Card, Divider, Avatar, Badge, Loader } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconBrain, IconHeart, IconPencil, IconSparkles } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient, UserCharacteristicResponse } from '../utils/api'
import { useEffect, useState } from 'react'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [characteristics, setCharacteristics] = useState<UserCharacteristicResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCharacteristics = async () => {
      try {
        const data = await apiClient.getUserCharacteristics()
        setCharacteristics(data)
      } catch (error) {
        console.error('Failed to fetch characteristics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCharacteristics()
  }, [])

  // Default characteristics if not loaded or empty
  const userCharacteristic = characteristics || {
    general_description: "Начните вести дневник, и здесь появится ваша характеристика.",
    main_themes: [],
    emotional_profile: {
      average_mood: 0.0,
      dominant_emotions: [],
      emotional_range: "Не определено",
    },
    writing_style: {
      average_length: "Не определено",
      tone: "Не определено",
      common_patterns: [],
    },
  }

  const getMoodColor = (rating: number) => {
    if (rating >= 0.5) return '#22c55e'
    if (rating >= 0) return '#84cc16'
    if (rating >= -0.5) return '#f59e0b'
    return '#ef4444'
  }

  const getMoodLabel = (rating: number) => {
    if (rating >= 0.5) return 'Очень позитивное'
    if (rating >= 0) return 'Позитивное'
    if (rating >= -0.5) return 'Нейтральное'
    return 'Негативное'
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--theme-bg)',
        padding: isMobile ? '20px 16px' : '40px',
      }}
    >
      <Container size="md">
        <Stack gap="xl">
          {/* Header */}
          <Group gap="md" align="center">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => navigate('/dashboard')}
              style={{
                color: 'var(--theme-text)',
                backgroundColor: 'transparent',
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
            <Title
              order={1}
              style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: 400,
                color: 'var(--theme-text)',
              }}
            >
              Профиль
            </Title>
          </Group>

          <Divider style={{ borderColor: 'var(--theme-border)' }} />

          {/* User Info */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Group gap="md" align="center">
              <Avatar
                src={user?.picture || undefined}
                radius="xl"
                size={isMobile ? 64 : 80}
                style={{
                  border: '2px solid var(--theme-border)',
                }}
              >
                {!user?.picture && (
                  <Box
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--theme-hover)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '24px' : '32px',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </Box>
                )}
              </Avatar>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: 500,
                    color: 'var(--theme-text)',
                  }}
                >
                  {user?.name || user?.email || 'Пользователь'}
                </Text>
                {user?.name && (
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {user.email}
                  </Text>
                )}
              </Stack>
            </Group>
          </Card>

          {/* AI Characteristic Section */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Stack gap="lg">
              <Group gap="xs" align="center">
                <IconSparkles size={20} style={{ color: 'var(--theme-primary)' }} />
                <Text
                  style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 500,
                    color: 'var(--theme-text)',
                  }}
                >
                  Характеристика
                </Text>
              </Group>
              <Text
                size="sm"
                style={{
                  color: 'var(--theme-text-secondary)',
                }}
              >
                Анализ вашего дневника, выполненный искусственным интеллектом
              </Text>

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* General Description */}
              <Box>
                <Group gap="xs" align="center" style={{ marginBottom: '12px' }}>
                  <IconBrain size={18} style={{ color: 'var(--theme-primary)' }} />
                  <Text
                    style={{
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 500,
                      color: 'var(--theme-text)',
                    }}
                  >
                    Общая характеристика
                  </Text>
                </Group>
                {loading ? (
                  <Group gap="xs">
                    <Loader size="sm" color="var(--theme-primary)" />
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '15px',
                        color: 'var(--theme-text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      Загрузка характеристики...
                    </Text>
                  </Group>
                ) : (
                  <Text
                    style={{
                      fontSize: isMobile ? '14px' : '15px',
                      lineHeight: 1.7,
                      color: 'var(--theme-text)',
                    }}
                  >
                    {userCharacteristic.general_description || "Начните вести дневник, и здесь появится ваша характеристика."}
                  </Text>
                )}
              </Box>

              <Divider style={{ borderColor: 'var(--theme-border)' }} />

              {/* Main Themes */}
              {!loading && (
                <Box>
                  <Group gap="xs" align="center" style={{ marginBottom: '12px' }}>
                    <IconPencil size={18} style={{ color: 'var(--theme-primary)' }} />
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: 500,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Основные темы
                    </Text>
                  </Group>
                  <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                    {(userCharacteristic.main_themes || []).map((theme, idx) => (
                      <Badge
                        key={idx}
                        variant="light"
                        radius="sm"
                        style={{
                          backgroundColor: 'var(--theme-hover)',
                          color: 'var(--theme-text-secondary)',
                          border: '1px solid var(--theme-border)',
                          fontWeight: 400,
                          fontSize: '13px',
                          padding: '6px 12px',
                        }}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              {!loading && userCharacteristic.emotional_profile && (
                <>
                  <Divider style={{ borderColor: 'var(--theme-border)' }} />

                  {/* Emotional Profile */}
                  <Box>
                    <Group gap="xs" align="center" style={{ marginBottom: '12px' }}>
                      <IconHeart size={18} style={{ color: 'var(--theme-primary)' }} />
                      <Text
                        style={{
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: 500,
                          color: 'var(--theme-text)',
                        }}
                      >
                        Эмоциональный профиль
                      </Text>
                    </Group>
                    <Stack gap="sm">
                      <Group gap="md" align="center">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Среднее настроение:
                        </Text>
                        <Group gap="xs" align="center">
                          <Text
                            style={{
                              fontSize: '16px',
                              fontWeight: 500,
                              fontFamily: 'monospace',
                              color: getMoodColor(userCharacteristic.emotional_profile?.average_mood || 0),
                            }}
                          >
                            {(userCharacteristic.emotional_profile?.average_mood || 0).toFixed(2)}
                          </Text>
                          <Text
                            size="sm"
                            style={{
                              color: 'var(--theme-text-secondary)',
                            }}
                          >
                            ({getMoodLabel(userCharacteristic.emotional_profile?.average_mood || 0)})
                          </Text>
                        </Group>
                      </Group>
                      <Group gap="md" align="center">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Преобладающие эмоции:
                        </Text>
                        <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                          {(userCharacteristic.emotional_profile?.dominant_emotions || []).map((emotion, idx) => (
                            <Badge
                              key={idx}
                              variant="light"
                              radius="sm"
                              style={{
                                backgroundColor: 'var(--theme-hover)',
                                color: 'var(--theme-text-secondary)',
                                border: '1px solid var(--theme-border)',
                                fontWeight: 400,
                                fontSize: '12px',
                                padding: '4px 10px',
                              }}
                            >
                              {emotion}
                            </Badge>
                          ))}
                        </Group>
                      </Group>
                      <Group gap="md" align="center">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Эмоциональный диапазон:
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                          }}
                        >
                          {userCharacteristic.emotional_profile?.emotional_range || "Не определено"}
                        </Text>
                      </Group>
                    </Stack>
                  </Box>
                </>
              )}

              {!loading && userCharacteristic.writing_style && (
                <>
                  <Divider style={{ borderColor: 'var(--theme-border)' }} />

                  {/* Writing Style */}
                  <Box>
                    <Group gap="xs" align="center" style={{ marginBottom: '12px' }}>
                      <IconPencil size={18} style={{ color: 'var(--theme-primary)' }} />
                      <Text
                        style={{
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: 500,
                          color: 'var(--theme-text)',
                        }}
                      >
                        Стиль письма
                      </Text>
                    </Group>
                    <Stack gap="sm">
                      <Group gap="md" align="center">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Средняя длина:
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                          }}
                        >
                          {userCharacteristic.writing_style?.average_length || "Не определено"}
                        </Text>
                      </Group>
                      <Group gap="md" align="flex-start">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Тон:
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                          }}
                        >
                          {userCharacteristic.writing_style?.tone || "Не определено"}
                        </Text>
                      </Group>
                      <Group gap="md" align="flex-start">
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            minWidth: '120px',
                          }}
                        >
                          Частые паттерны:
                        </Text>
                        <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                          {(userCharacteristic.writing_style?.common_patterns || []).map((pattern, idx) => (
                            <Badge
                              key={idx}
                              variant="light"
                              radius="sm"
                              style={{
                                backgroundColor: 'var(--theme-hover)',
                                color: 'var(--theme-text-secondary)',
                                border: '1px solid var(--theme-border)',
                                fontWeight: 400,
                                fontSize: '12px',
                                padding: '4px 10px',
                              }}
                            >
                              {pattern}
                            </Badge>
                          ))}
                        </Group>
                      </Group>
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          </Card>

          {/* Note about future updates */}
          <Card
            padding={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Text
              size="sm"
              style={{
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              Характеристика будет автоматически обновляться по мере анализа ваших записей
            </Text>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}

