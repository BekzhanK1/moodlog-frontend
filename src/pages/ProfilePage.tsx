import { Box, Container, Title, Stack, Group, Button, Text, Card, Divider, Avatar, Badge, Loader } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconBrain, IconHeart, IconPencil, IconSparkles, IconUser } from '@tabler/icons-react'
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
      <Container size={isMobile ? '100%' : 'md'}>
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
                <IconUser size={24} />
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
                  Профиль
                </Title>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  Ваша характеристика и статистика
                </Text>
              </Box>
            </Group>
          </Stack>

          <Divider style={{ borderColor: 'var(--theme-border)', opacity: 0.5 }} />

          {/* User Info */}
          <Card
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
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
            padding={isMobile ? 'md' : 'xl'}
            radius="lg"
            style={{
              backgroundColor: 'var(--theme-surface)',
              border: '1px solid var(--theme-border)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <Stack gap="xl">
              <Box>
                <Group gap="xs" align="center" mb={8}>
                  <Box
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSparkles size={18} style={{ color: 'var(--theme-primary)' }} />
                  </Box>
                  <Text
                    style={{
                      fontSize: isMobile ? '18px' : '20px',
                      fontWeight: 600,
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
                    lineHeight: 1.5,
                  }}
                >
                  Анализ вашего дневника, выполненный искусственным интеллектом
                </Text>
              </Box>

              {/* General Description */}
              <Box
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--theme-bg)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Group gap="xs" align="center" style={{ marginBottom: '16px' }}>
                  <Box
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconBrain size={16} style={{ color: 'var(--theme-primary)' }} />
                  </Box>
                  <Text
                    style={{
                      fontSize: isMobile ? '15px' : '17px',
                      fontWeight: 600,
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
                      lineHeight: 1.8,
                      color: 'var(--theme-text)',
                    }}
                  >
                    {userCharacteristic.general_description || "Начните вести дневник, и здесь появится ваша характеристика."}
                  </Text>
                )}
              </Box>

              {/* Main Themes */}
              {!loading && (userCharacteristic.main_themes || []).length > 0 && (
                <Box
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--theme-bg)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Group gap="xs" align="center" style={{ marginBottom: '16px' }}>
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPencil size={16} style={{ color: 'var(--theme-primary)' }} />
                    </Box>
                    <Text
                      style={{
                        fontSize: isMobile ? '15px' : '17px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Основные темы
                    </Text>
                  </Group>
                  <Group gap="sm" style={{ flexWrap: 'wrap' }}>
                    {(userCharacteristic.main_themes || []).map((theme, idx) => (
                      <Badge
                        key={idx}
                        variant="light"
                        radius="md"
                        style={{
                          backgroundColor: 'var(--theme-hover)',
                          color: 'var(--theme-text)',
                          border: '1px solid var(--theme-border)',
                          fontWeight: 500,
                          fontSize: '13px',
                          padding: '8px 14px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                          e.currentTarget.style.color = 'var(--theme-bg)'
                          e.currentTarget.style.borderColor = 'var(--theme-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                          e.currentTarget.style.color = 'var(--theme-text)'
                          e.currentTarget.style.borderColor = 'var(--theme-border)'
                        }}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </Group>
                </Box>
              )}

              {!loading && userCharacteristic.emotional_profile && (
                <Box
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--theme-bg)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Group gap="xs" align="center" style={{ marginBottom: '20px' }}>
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconHeart size={16} style={{ color: 'var(--theme-primary)' }} />
                    </Box>
                    <Text
                      style={{
                        fontSize: isMobile ? '15px' : '17px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Эмоциональный профиль
                    </Text>
                  </Group>
                    <Stack gap="md">
                      <Box
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--theme-surface)',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            marginBottom: '8px',
                            fontWeight: 500,
                          }}
                        >
                          Среднее настроение
                        </Text>
                        <Group gap="xs" align="center">
                          <Text
                            style={{
                              fontSize: '20px',
                              fontWeight: 600,
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
                      </Box>
                      {(userCharacteristic.emotional_profile?.dominant_emotions || []).length > 0 && (
                        <Box>
                          <Text
                            size="sm"
                            style={{
                              color: 'var(--theme-text-secondary)',
                              marginBottom: '12px',
                              fontWeight: 500,
                            }}
                          >
                            Преобладающие эмоции
                          </Text>
                          <Group gap="sm" style={{ flexWrap: 'wrap' }}>
                            {(userCharacteristic.emotional_profile?.dominant_emotions || []).map((emotion, idx) => (
                              <Badge
                                key={idx}
                                variant="light"
                                radius="md"
                                style={{
                                  backgroundColor: 'var(--theme-hover)',
                                  color: 'var(--theme-text)',
                                  border: '1px solid var(--theme-border)',
                                  fontWeight: 500,
                                  fontSize: '13px',
                                  padding: '6px 12px',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                                  e.currentTarget.style.color = 'var(--theme-bg)'
                                  e.currentTarget.style.borderColor = 'var(--theme-primary)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                                  e.currentTarget.style.color = 'var(--theme-text)'
                                  e.currentTarget.style.borderColor = 'var(--theme-border)'
                                }}
                              >
                                {emotion}
                              </Badge>
                            ))}
                          </Group>
                        </Box>
                      )}
                      {userCharacteristic.emotional_profile?.emotional_range && (
                        <Box>
                          <Text
                            size="sm"
                            style={{
                              color: 'var(--theme-text-secondary)',
                              marginBottom: '8px',
                              fontWeight: 500,
                            }}
                          >
                            Эмоциональный диапазон
                          </Text>
                          <Text
                            size="sm"
                            style={{
                              color: 'var(--theme-text)',
                              fontWeight: 500,
                            }}
                          >
                            {userCharacteristic.emotional_profile?.emotional_range}
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </Box>
              )}

              {!loading && userCharacteristic.writing_style && (
                <Box
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--theme-bg)',
                    border: '1px solid var(--theme-border)',
                  }}
                >
                  <Group gap="xs" align="center" style={{ marginBottom: '20px' }}>
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPencil size={16} style={{ color: 'var(--theme-primary)' }} />
                    </Box>
                    <Text
                      style={{
                        fontSize: isMobile ? '15px' : '17px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Стиль письма
                    </Text>
                  </Group>
                  <Stack gap="md">
                    {userCharacteristic.writing_style?.average_length && userCharacteristic.writing_style.average_length !== "Не определено" && (
                      <Box>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            marginBottom: '8px',
                            fontWeight: 500,
                          }}
                        >
                          Средняя длина
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                            fontWeight: 500,
                          }}
                        >
                          {userCharacteristic.writing_style.average_length}
                        </Text>
                      </Box>
                    )}
                    {userCharacteristic.writing_style?.tone && userCharacteristic.writing_style.tone !== "Не определено" && (
                      <Box>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            marginBottom: '8px',
                            fontWeight: 500,
                          }}
                        >
                          Тон
                        </Text>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text)',
                            fontWeight: 500,
                          }}
                        >
                          {userCharacteristic.writing_style.tone}
                        </Text>
                      </Box>
                    )}
                    {(userCharacteristic.writing_style?.common_patterns || []).length > 0 && (
                      <Box>
                        <Text
                          size="sm"
                          style={{
                            color: 'var(--theme-text-secondary)',
                            marginBottom: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Частые паттерны
                        </Text>
                        <Group gap="sm" style={{ flexWrap: 'wrap' }}>
                          {(userCharacteristic.writing_style?.common_patterns || []).map((pattern, idx) => (
                            <Badge
                              key={idx}
                              variant="light"
                              radius="md"
                              style={{
                                backgroundColor: 'var(--theme-hover)',
                                color: 'var(--theme-text)',
                                border: '1px solid var(--theme-border)',
                                fontWeight: 500,
                                fontSize: '13px',
                                padding: '6px 12px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                                e.currentTarget.style.color = 'var(--theme-bg)'
                                e.currentTarget.style.borderColor = 'var(--theme-primary)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                                e.currentTarget.style.color = 'var(--theme-text)'
                                e.currentTarget.style.borderColor = 'var(--theme-border)'
                              }}
                            >
                              {pattern}
                            </Badge>
                          ))}
                        </Group>
                      </Box>
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Card>

          {/* Note about future updates */}
          <Box
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'color-mix(in srgb, var(--theme-primary) 5%, transparent)',
              border: '1px dashed var(--theme-border)',
              textAlign: 'center',
            }}
          >
            <Text
              size="sm"
              style={{
                color: 'var(--theme-text-secondary)',
                fontStyle: 'italic',
              }}
            >
              Характеристика будет автоматически обновляться по мере анализа ваших записей
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

