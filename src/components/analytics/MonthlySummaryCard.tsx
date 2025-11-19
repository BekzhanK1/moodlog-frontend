import { Card, Text, Stack, Group, Box, Divider, Button, ActionIcon } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBrain, IconTrendingUp, IconSparkles, IconBulb, IconChevronLeft, IconChevronRight, IconCalendar, IconList } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'
import { InsightsListModal } from './InsightsListModal'

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

interface MonthlyInsight {
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

export function MonthlySummaryCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [insight, setInsight] = useState<MonthlyInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [listModalOpened, setListModalOpened] = useState(false)
  
  // Состояние для текущего месяца
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)

  // Проверка, является ли выбранный месяц текущим
  const isCurrentMonth = () => {
    const now = new Date()
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
  }

  // Проверка, является ли выбранный месяц прошлым
  const isPastMonth = () => {
    const now = new Date()
    if (currentYear < now.getFullYear()) return true
    if (currentYear === now.getFullYear() && currentMonth < now.getMonth() + 1) return true
    return false
  }

  useEffect(() => {
    const fetchExistingInsight = async () => {
      setLoading(true)
      setInsight(null)
      setError(null)
      try {
        const result = await apiClient.getMonthlyInsights(currentYear, currentMonth)
        
        if (result && result.content) {
          // Parse JSON content if it's a string
          try {
            const parsedContent: MonthlyInsight = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
            setInsight(parsedContent)
          } catch {
            // If parsing fails, treat as plain text
            const periodLabel = result.period_label || `${monthNames[currentMonth - 1]} ${currentYear}`
            setInsight({
              period: {
                type: 'monthly',
                label: periodLabel,
                key: result.period_key || `${currentYear}-${String(currentMonth).padStart(2, '0')}`
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
  }, [currentYear, currentMonth])

  const handlePrevious = () => {
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1)
    } else {
      setCurrentYear(currentYear - 1)
      setCurrentMonth(12)
    }
  }

  const handleNext = () => {
    // Нельзя переходить к будущим месяцам
    if (isCurrentMonth()) {
      return
    }
  }

  const handleCurrentMonth = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
  }

  const handleSelectFromList = (periodKey: string) => {
    // periodKey format: "2025-11"
    const match = periodKey.match(/^(\d{4})-(\d{2})$/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10)
      setCurrentYear(year)
      setCurrentMonth(month)
    }
  }

  const getMonthLabel = () => {
    return `${monthNames[currentMonth - 1]} ${currentYear}`
  }

  const generateInsights = async () => {
    if (!isCurrentMonth()) {
      setError('Нельзя генерировать сводку для прошлых месяцев')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const result = await apiClient.generateMonthlyInsights(currentYear, currentMonth)
      
      // Parse JSON content if it's a string
      let parsedContent: MonthlyInsight
      try {
        parsedContent = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
      } catch {
        // If parsing fails, treat as plain text
        const periodLabel = result.period_label || `${monthNames[currentMonth - 1]} ${currentYear}`
        setInsight({
          period: {
            type: 'monthly',
            label: periodLabel,
            key: result.period_key || `${currentYear}-${String(currentMonth).padStart(2, '0')}`
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage.includes('404') || errorMessage.includes('No entries')) {
        setError('Недостаточно записей для генерации сводки')
      } else {
        setError('Не удалось сгенерировать сводку')
      }
      console.error('Failed to generate insights:', err)
    } finally {
      setGenerating(false)
    }
  }

  // Проверка, можно ли создавать сводку (только в последние 5 дней месяца и только для текущего месяца)
  const canGenerateSummary = () => {
    if (!isCurrentMonth()) return false
    const now = new Date()
    const currentDay = now.getDate()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return currentDay >= lastDayOfMonth - 4 // Последние 5 дней (включая сегодня)
  }

  const getDaysUntilSummaryAvailable = () => {
    if (!isCurrentMonth()) return 0
    const now = new Date()
    const currentDay = now.getDate()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysUntil = (lastDayOfMonth - 4) - currentDay
    return daysUntil > 0 ? daysUntil : 0
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
            Ежемесячная сводка от ИИ
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
            <Text style={{ color: 'var(--theme-text)', minWidth: isMobile ? '140px' : '180px', textAlign: 'center', fontSize: isMobile ? '13px' : '14px' }}>
              {getMonthLabel()}
            </Text>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handleNext}
              disabled={isCurrentMonth()}
              style={{
                color: isCurrentMonth() ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                cursor: isCurrentMonth() ? 'not-allowed' : 'pointer',
              }}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconCalendar size={14} />}
              onClick={handleCurrentMonth}
              style={{
                color: 'var(--theme-text)',
              }}
            >
              {isMobile ? 'Сейчас' : 'Текущий'}
            </Button>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconList size={14} />}
              onClick={() => setListModalOpened(true)}
              style={{
                color: 'var(--theme-text)',
              }}
            >
              {isMobile ? 'Список' : 'Все сводки'}
            </Button>
          </Group>
        </Group>

        <InsightsListModal
          opened={listModalOpened}
          onClose={() => setListModalOpened(false)}
          type="monthly"
          onSelect={handleSelectFromList}
        />

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
                {isPastMonth() ? `Сводка за ${getMonthLabel()} не найдена` : `Ваш ${monthNames[currentMonth - 1]} в одном абзаце:`}
              </Text>
            </Group>
            {isPastMonth() ? (
              <Text
                style={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: isMobile ? '14px' : '16px',
                }}
              >
                Нельзя генерировать сводку для прошлых месяцев. Используйте навигацию для просмотра существующих сводок.
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
                  Сводка за этот месяц еще не создана. Нажмите кнопку ниже, чтобы сгенерировать её.
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
                  Сводка за этот месяц еще не создана.
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
                    Ежемесячную сводку можно создать только в последние 5 дней месяца. 
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
