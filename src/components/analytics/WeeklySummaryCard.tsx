import { Card, Text, Stack, Group, Box, Divider, Button, ActionIcon } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBrain, IconTrendingUp, IconSparkles, IconBulb, IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

// Функция для получения ISO недели из даты
function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}


interface WeeklyInsight {
  period: {
    type: string
    label: string
    key: string
  }
  language: string
  overview: string
  mood_trend: {
    summary: string
  }
  themes: Array<{
    tag: string
    note: string
  }>
  notable_moments: Array<{
    title: string
    date: string
    summary: string
  }>
  suggestions: string[]
  meta?: {
    tokens_used?: number
  }
}

export function WeeklySummaryCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [insight, setInsight] = useState<WeeklyInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Состояние для текущей недели
  const now = new Date()
  const currentISO = getISOWeek(now)
  const [currentYear, setCurrentYear] = useState(currentISO.year)
  const [currentWeek, setCurrentWeek] = useState(currentISO.week)

  // Проверка, является ли выбранная неделя текущей
  const isCurrentWeek = () => {
    const nowISO = getISOWeek(new Date())
    return currentYear === nowISO.year && currentWeek === nowISO.week
  }

  // Проверка, является ли выбранная неделя прошлой
  const isPastWeek = () => {
    const nowISO = getISOWeek(new Date())
    if (currentYear < nowISO.year) return true
    if (currentYear === nowISO.year && currentWeek < nowISO.week) return true
    return false
  }

  useEffect(() => {
    const fetchExistingInsight = async () => {
      setLoading(true)
      setInsight(null)
      setError(null)
      try {
        const result = await apiClient.getWeeklyInsights(currentYear, currentWeek)
        
        if (result && result.content) {
          // Parse JSON content if it's a string
          try {
            const parsedContent: WeeklyInsight = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
            setInsight(parsedContent)
          } catch {
            // If parsing fails, treat as plain text
            setInsight({
              period: {
                type: 'weekly',
                label: result.period_label || `Неделя ${currentWeek}, ${currentYear}`,
                key: result.period_key || `${currentYear}-W${String(currentWeek).padStart(2, '0')}`
              },
              language: 'русский',
              overview: result.content,
              mood_trend: { summary: '' },
              themes: [],
              notable_moments: [],
              suggestions: []
            })
          }
        }
      } catch (err) {
        console.error('Failed to fetch existing insight:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExistingInsight()
  }, [currentYear, currentWeek])

  const handlePrevious = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1)
    } else {
      setCurrentYear(currentYear - 1)
      // Последняя неделя года может быть 52 или 53
      setCurrentWeek(53) // Попробуем 53, если не будет данных, пользователь увидит пустую сводку
    }
  }

  const handleNext = () => {
    // Нельзя переходить к будущим неделям
    if (isPastWeek() || !isCurrentWeek()) {
      return
    }
    // Если мы на текущей неделе, нельзя идти вперед
    if (isCurrentWeek()) {
      return
    }
  }

  const handleCurrentWeek = () => {
    const nowISO = getISOWeek(new Date())
    setCurrentYear(nowISO.year)
    setCurrentWeek(nowISO.week)
  }

  const getWeekLabel = () => {
    return `Неделя ${currentWeek}, ${currentYear}`
  }

  const generateInsights = async () => {
    if (!isCurrentWeek()) {
      setError('Нельзя генерировать сводку для прошлых недель')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const result = await apiClient.generateWeeklyInsights(currentYear, currentWeek)
      
      // Parse JSON content if it's a string
      let parsedContent: WeeklyInsight
      try {
        parsedContent = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
      } catch {
        // If parsing fails, treat as plain text
        setInsight({
          period: {
            type: 'weekly',
            label: result.period_label || `Неделя ${currentWeek}, ${currentYear}`,
            key: result.period_key || `${currentYear}-W${String(currentWeek).padStart(2, '0')}`
          },
          language: 'русский',
          overview: result.content,
          mood_trend: { summary: '' },
          themes: [],
          notable_moments: [],
          suggestions: []
        })
        setGenerating(false)
        return
      }
      
      setInsight(parsedContent)
    } catch (err: any) {
      if (err?.message?.includes('404') || err?.message?.includes('No entries')) {
        setError('Недостаточно записей для генерации сводки')
      } else {
        setError('Не удалось сгенерировать сводку')
      }
      console.error('Failed to generate insights:', err)
    } finally {
      setGenerating(false)
    }
  }

  // Проверка, можно ли создавать сводку (только в последние 2 дня недели и только для текущей недели)
  const canGenerateSummary = () => {
    if (!isCurrentWeek()) return false
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
    // Можно создавать в субботу (6) и воскресенье (0)
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const getDaysUntilSummaryAvailable = () => {
    if (!isCurrentWeek()) return 0
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
    // Если сегодня понедельник (1), то до субботы 5 дней
    // Если вторник (2), то 4 дня и т.д.
    if (dayOfWeek === 0) return 0 // Воскресенье - можно создавать
    if (dayOfWeek === 6) return 0 // Суббота - можно создавать
    return 6 - dayOfWeek // Осталось дней до субботы
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    })
  }

  return (
    <Card
      padding={isMobile ? 'md' : 'lg'}
      radius="md"
      style={{
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap">
          <Text
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              color: 'var(--theme-text)',
            }}
          >
            Еженедельная сводка от ИИ
          </Text>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handlePrevious}
              style={{
                color: 'var(--theme-text)',
              }}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Text style={{ color: 'var(--theme-text)', minWidth: isMobile ? '120px' : '150px', textAlign: 'center', fontSize: isMobile ? '13px' : '14px' }}>
              {getWeekLabel()}
            </Text>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handleNext}
              disabled={isCurrentWeek()}
              style={{
                color: isCurrentWeek() ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                cursor: isCurrentWeek() ? 'not-allowed' : 'pointer',
              }}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconCalendar size={14} />}
              onClick={handleCurrentWeek}
              style={{
                color: 'var(--theme-text)',
              }}
            >
              {isMobile ? 'Сейчас' : 'Текущий'}
            </Button>
          </Group>
        </Group>

        {loading && (
          <Box style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка сводки...</Text>
          </Box>
        )}

        {!insight && !loading && (
          <Box>
            <Group gap="xs" align="center" mb="md">
              <IconBrain size={18} style={{ color: 'var(--theme-text-secondary)' }} />
              <Text style={{ color: 'var(--theme-text)', fontSize: isMobile ? '14px' : '16px' }}>
                {isPastWeek() ? `Сводка за ${getWeekLabel()} не найдена` : `Ваша ${getWeekLabel()} в одном абзаце:`}
              </Text>
            </Group>
            {isPastWeek() ? (
              <Text
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                Нельзя генерировать сводку для прошлых недель. Используйте навигацию для просмотра существующих сводок.
              </Text>
            ) : canGenerateSummary() ? (
              <>
                <Text
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontSize: isMobile ? '14px' : '16px',
                    marginBottom: '16px',
                  }}
                >
                  Сводка за эту неделю еще не создана. Нажмите кнопку ниже, чтобы сгенерировать её.
                </Text>
                <Button
                  onClick={generateInsights}
                  loading={generating}
                  radius="md"
                  style={{
                    backgroundColor: 'var(--theme-primary)',
                    color: 'var(--theme-bg)',
                  }}
                >
                  Сгенерировать сводку
                </Button>
              </>
            ) : (
              <>
                <Text
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontSize: isMobile ? '14px' : '16px',
                    marginBottom: '12px',
                  }}
                >
                  Сводка за эту неделю еще не создана.
                </Text>
                <Box
                  style={{
                    padding: '12px',
                    backgroundColor: 'var(--theme-hover)',
                    borderRadius: '8px',
                    border: '1px solid var(--theme-border)',
                    marginBottom: '16px',
                  }}
                >
                  <Text
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontSize: isMobile ? '13px' : '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    Еженедельную сводку можно создать только в выходные дни (суббота или воскресенье). 
                    {getDaysUntilSummaryAvailable() > 0 && (
                      <> Осталось {getDaysUntilSummaryAvailable()} {getDaysUntilSummaryAvailable() === 1 ? 'день' : getDaysUntilSummaryAvailable() < 5 ? 'дня' : 'дней'} до возможности создания сводки.</>
                    )}
                  </Text>
                </Box>
                <Button
                  disabled
                  radius="md"
                  style={{
                    backgroundColor: 'var(--theme-border)',
                    color: 'var(--theme-text-secondary)',
                    cursor: 'not-allowed',
                  }}
                >
                  Сгенерировать сводку
                </Button>
              </>
            )}
          </Box>
        )}

        {generating && (
          <Box style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ color: 'var(--theme-text-secondary)' }}>Генерация сводки...</Text>
          </Box>
        )}

        {error && (
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--theme-hover)',
              borderRadius: '8px',
              border: '1px solid var(--theme-border)',
            }}
          >
            <Text style={{ color: '#ef4444' }}>{error}</Text>
          </Box>
        )}

        {insight && (
          <Stack gap="lg">
            {/* Overview */}
            <Box>
              <Group gap="xs" align="center" mb="sm">
                <IconBrain size={18} style={{ color: 'var(--theme-primary)' }} />
                <Text
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                  }}
                >
                  Общий обзор
                </Text>
              </Group>
              <Text
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: isMobile ? '14px' : '16px',
                  lineHeight: 1.7,
                }}
              >
                {insight.overview}
              </Text>
            </Box>

            <Divider style={{ borderColor: 'var(--theme-border)' }} />

            {/* Mood Trend */}
            {insight.mood_trend?.summary && (
              <Box>
                <Group gap="xs" align="center" mb="sm">
                  <IconTrendingUp size={18} style={{ color: 'var(--theme-primary)' }} />
                  <Text
                    style={{
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: 600,
                      color: 'var(--theme-text)',
                    }}
                  >
                    Тренд настроения
                  </Text>
                </Group>
                <Text
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontSize: isMobile ? '14px' : '16px',
                    lineHeight: 1.7,
                  }}
                >
                  {insight.mood_trend.summary}
                </Text>
              </Box>
            )}

            {/* Themes */}
            {insight.themes && insight.themes.length > 0 && (
              <>
                <Divider style={{ borderColor: 'var(--theme-border)' }} />
                <Box>
                  <Group gap="xs" align="center" mb="sm">
                    <IconBulb size={18} style={{ color: 'var(--theme-primary)' }} />
                    <Text
                      style={{
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Основные темы
                    </Text>
                  </Group>
                  <Stack gap="md">
                    {insight.themes.map((theme, index) => (
                      <Box
                        key={index}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--theme-hover)',
                          borderRadius: '8px',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: isMobile ? '14px' : '16px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                            marginBottom: '4px',
                          }}
                        >
                          #{theme.tag}
                        </Text>
                        <Text
                          style={{
                            fontSize: isMobile ? '13px' : '14px',
                            color: 'var(--theme-text-secondary)',
                            lineHeight: 1.6,
                          }}
                        >
                          {theme.note}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Notable Moments */}
            {insight.notable_moments && insight.notable_moments.length > 0 && (
              <>
                <Divider style={{ borderColor: 'var(--theme-border)' }} />
                <Box>
                  <Group gap="xs" align="center" mb="sm">
                    <IconSparkles size={18} style={{ color: 'var(--theme-primary)' }} />
                    <Text
                      style={{
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Значимые моменты
                    </Text>
                  </Group>
                  <Stack gap="md">
                    {insight.notable_moments.map((moment, index) => (
                      <Box
                        key={index}
                        style={{
                          padding: '12px',
                          backgroundColor: 'var(--theme-hover)',
                          borderRadius: '8px',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <Group gap="xs" align="center" mb="xs">
                          <Text
                            style={{
                              fontSize: isMobile ? '14px' : '16px',
                              fontWeight: 600,
                              color: 'var(--theme-text)',
                            }}
                          >
                            {moment.title}
                          </Text>
                          <Text
                            style={{
                              fontSize: isMobile ? '12px' : '13px',
                              color: 'var(--theme-text-secondary)',
                            }}
                          >
                            {formatDate(moment.date)}
                          </Text>
                        </Group>
                        <Text
                          style={{
                            fontSize: isMobile ? '13px' : '14px',
                            color: 'var(--theme-text-secondary)',
                            lineHeight: 1.6,
                          }}
                        >
                          {moment.summary}
                        </Text>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </>
            )}

            {/* Suggestions */}
            {insight.suggestions && insight.suggestions.length > 0 && (
              <>
                <Divider style={{ borderColor: 'var(--theme-border)' }} />
                <Box>
                  <Group gap="xs" align="center" mb="sm">
                    <IconBulb size={18} style={{ color: 'var(--theme-primary)' }} />
                    <Text
                      style={{
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 600,
                        color: 'var(--theme-text)',
                      }}
                    >
                      Рекомендации
                    </Text>
                  </Group>
                  <Stack gap="sm">
                    {insight.suggestions.map((suggestion, index) => (
                      <Group key={index} gap="sm" align="flex-start">
                        <Box
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--theme-primary)',
                            marginTop: '6px',
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: isMobile ? '14px' : '16px',
                            color: 'var(--theme-text-secondary)',
                            lineHeight: 1.7,
                            flex: 1,
                          }}
                        >
                          {suggestion}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}

