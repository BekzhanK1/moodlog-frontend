import { Card, Text, Stack, Group, Box, Divider, Badge, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBrain, IconTrendingUp, IconSparkles, IconBulb } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

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

  useEffect(() => {
    const fetchExistingInsight = async () => {
      setLoading(true)
      try {
        const now = new Date()
        const result = await apiClient.getMonthlyInsights(now.getFullYear(), now.getMonth() + 1)
        
        if (result && result.content) {
          // Parse JSON content if it's a string
          try {
            const parsedContent: MonthlyInsight = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
            setInsight(parsedContent)
          } catch {
            // If parsing fails, treat as plain text
            const now = new Date()
            setInsight({
              period: {
                type: 'monthly',
                label: result.period_label || now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
                key: result.period_key || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
  }, [])

  const generateInsights = async () => {
    setGenerating(true)
    setError(null)
    try {
      const now = new Date()
      const result = await apiClient.generateMonthlyInsights(now.getFullYear(), now.getMonth() + 1)
      
      // Parse JSON content if it's a string
      let parsedContent: MonthlyInsight
      try {
        parsedContent = typeof result.content === 'string' ? JSON.parse(result.content) : result.content
      } catch {
        // If parsing fails, treat as plain text
        setInsight({
          period: {
            type: 'monthly',
            label: result.period_label || now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
            key: result.period_key || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
        <Group justify="space-between" align="center">
          <Text
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              color: 'var(--theme-text)',
            }}
          >
            Ежемесячная сводка от ИИ
          </Text>
          {insight && (
            <Badge
              variant="light"
              style={{
                backgroundColor: 'var(--theme-hover)',
                color: 'var(--theme-text-secondary)',
                border: '1px solid var(--theme-border)',
              }}
            >
              {insight.period.label}
            </Badge>
          )}
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
                Ваш {new Date().toLocaleDateString('ru-RU', { month: 'long' })} в одном абзаце:
              </Text>
            </Group>
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
