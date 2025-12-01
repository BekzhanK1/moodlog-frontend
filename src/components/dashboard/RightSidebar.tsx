import { useState, useEffect } from 'react'
import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  Loader,
  Button,
} from '@mantine/core'
import {
  IconChevronRight,
  IconChevronLeft,
  IconHash,
  IconTemperature,
  IconRefresh,
  IconSparkles,
} from '@tabler/icons-react'
import { EntryResponse } from '../../utils/api'
import { shouldHighlightTag } from '../../utils/highlight'
import { getCurrentWeather, getWeatherIconUrl, WeatherData } from '../../utils/weather'

interface RightSidebarProps {
  entry?: EntryResponse | null
  wordCount?: number
  isNewEntry?: boolean
  onTagClick?: (tag: string) => void
  searchQuery?: string
  writingQuestions?: string[]
  questionsLoading?: boolean
  onRefreshQuestions?: () => Promise<{ success: boolean; message?: string }>
  canRefreshQuestions?: () => { allowed: boolean; remaining: number; resetTime: number | null }
  onCollapseChange?: (collapsed: boolean) => void
}

export function RightSidebar({
  entry,
  wordCount,
  isNewEntry,
  onTagClick,
  searchQuery,
  writingQuestions = [],
  questionsLoading = false,
  onRefreshQuestions,
  canRefreshQuestions,
}: RightSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [refreshingQuestions, setRefreshingQuestions] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<{ allowed: boolean; remaining: number; resetTime: number | null } | null>(null)

  // Update rate limit info periodically
  useEffect(() => {
    if (canRefreshQuestions && isNewEntry) {
      const updateRateLimit = () => {
        setRateLimitInfo(canRefreshQuestions())
      }
      
      updateRateLimit()
      const interval = setInterval(updateRateLimit, 1000) // Update every second for countdown
      
      return () => clearInterval(interval)
    }
  }, [canRefreshQuestions, isNewEntry])

  const handleRefreshQuestions = async () => {
    if (!onRefreshQuestions || !rateLimitInfo?.allowed || refreshingQuestions) return

    setRefreshingQuestions(true)
    try {
      const result = await onRefreshQuestions()
      if (!result.success && result.message) {
        // Could show a notification here if needed
        console.log(result.message)
      }
      // Update rate limit info after refresh
      if (canRefreshQuestions) {
        setRateLimitInfo(canRefreshQuestions())
      }
    } catch (error) {
      console.error('Failed to refresh questions:', error)
    } finally {
      setRefreshingQuestions(false)
    }
  }

  const getTimeUntilReset = (resetTime: number | null): string => {
    if (!resetTime) return ''
    const now = Date.now()
    const diff = resetTime - now
    if (diff <= 0) return ''
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}м ${seconds}с`
    }
    return `${seconds}с`
  }

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true)
      setWeatherError(null)
      try {
        const weatherData = await getCurrentWeather()
        setWeather(weatherData)
      } catch (error) {
        console.error('Failed to fetch weather:', error)
        if (error instanceof Error) {
          if (error.message.includes('Geolocation')) {
            setWeatherError('Доступ к геолокации запрещён')
          } else if (error.message.includes('API key')) {
            setWeatherError('API ключ не настроен')
          } else {
            setWeatherError('Не удалось загрузить погоду')
          }
        } else {
          setWeatherError('Не удалось загрузить погоду')
        }
      } finally {
        setWeatherLoading(false)
      }
    }

    // Fetch weather only for new entries and if sidebar is not collapsed
    if (isNewEntry && !isCollapsed) {
      fetchWeather()
    }
  }, [isCollapsed, isNewEntry])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getMoodColor = (rating: number | null) => {
    if (rating === null) return '#999'
    if (rating >= 0.5) return '#22c55e'
    if (rating >= 0) return '#84cc16'
    if (rating >= -0.5) return '#f59e0b'
    return '#ef4444'
  }

  const getMoodLabel = (rating: number | null) => {
    if (rating === null) return 'Не определено'
    if (rating >= 0.5) return 'Очень позитивное'
    if (rating >= 0) return 'Позитивное'
    if (rating >= -0.5) return 'Нейтральное'
    return 'Негативное'
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const sidebarContent = (
    <Box style={{ padding: '24px', overflowY: 'auto', flex: 1, position: 'relative', zIndex: 1 }}>
        <Stack gap="xl">
          {isNewEntry ? (
            <>
              {/* Word count */}
              <Box
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Text
                  size="xs"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Количество слов
                </Text>
                <Text
                  size="lg"
                  style={{
                    color: 'var(--theme-primary)',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                  }}
                >
                  {wordCount || 0}
                </Text>
              </Box>

              {/* Current date */}
              <Box>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Дата
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text)',
                    fontWeight: 400,
                  }}
                >
                  {new Date().toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Box>

              {/* Weather */}
              <Box>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Погода
                </Text>
                {weatherLoading ? (
                  <Group gap="xs" align="center">
                    <Loader size="sm" color="var(--theme-primary)" />
                    <Text
                      size="sm"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      Загрузка...
                    </Text>
                  </Group>
                ) : weatherError ? (
                  <Text
                    size="sm"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontStyle: 'italic',
                    }}
                  >
                    {weatherError}
                  </Text>
                ) : weather ? (
                  <Group gap="xs" align="center">
                    {weather.icon && (
                      <img
                        src={getWeatherIconUrl(weather.icon)}
                        alt={weather.description}
                        style={{ width: '32px', height: '32px' }}
                      />
                    )}
                    <Group gap={4} align="center">
                      <IconTemperature size={16} style={{ color: 'var(--theme-text-secondary)' }} />
                      <Text
                        size="lg"
                        style={{
                          color: 'var(--theme-text)',
                          fontWeight: 400,
                          fontFamily: 'monospace',
                        }}
                      >
                        {weather.temperature}°
                      </Text>
                    </Group>
                  </Group>
                ) : null}
              </Box>

              {/* AI Questions */}
              <Box>
                <Group justify="space-between" align="center" style={{ marginBottom: '16px' }}>
                  <Group gap="xs" align="center">
                    <IconSparkles 
                      size={14} 
                      style={{ 
                        color: 'var(--theme-primary)',
                        opacity: 0.8,
                      }} 
                    />
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Вопросы от ИИ
                    </Text>
                  </Group>
                  {onRefreshQuestions && rateLimitInfo && (
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                      }}
                    >
                      {rateLimitInfo.remaining > 0 ? (
                        `Осталось: ${rateLimitInfo.remaining}`
                      ) : rateLimitInfo.resetTime ? (
                        `Через: ${getTimeUntilReset(rateLimitInfo.resetTime)}`
                      ) : null}
                    </Text>
                  )}
                </Group>
                {questionsLoading || refreshingQuestions ? (
                  <Group gap="xs" align="center">
                    <Loader size="sm" color="var(--theme-primary)" />
                    <Text
                      size="sm"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontStyle: 'italic',
                      }}
                    >
                      {refreshingQuestions ? 'Загрузка новых вопросов...' : 'Загрузка вопросов...'}
                    </Text>
                  </Group>
                ) : (
                  <Stack gap="sm">
                    {writingQuestions.map((question, index) => (
                      <Text
                        key={index}
                        size="sm"
                        style={{
                          color: 'var(--theme-text)',
                          fontWeight: 400,
                          lineHeight: 1.6,
                          opacity: 0,
                          animation: `fadeInUp 0.6s ease-out ${index * 0.15 + 0.2}s forwards`,
                        }}
                      >
                        {question}
                      </Text>
                    ))}
                    {onRefreshQuestions && (
                      <Button
                        variant="subtle"
                        size="xs"
                        leftSection={<IconRefresh size={14} />}
                        onClick={handleRefreshQuestions}
                        disabled={!rateLimitInfo?.allowed || refreshingQuestions}
                        fullWidth
                        style={{
                          marginTop: '8px',
                          color: rateLimitInfo?.allowed ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                        }}
                      >
                        Другие вопросы
                      </Button>
                    )}
                  </Stack>
                )}
              </Box>
            </>
          ) : entry ? (
            <>
              {/* Word count */}
              <Box>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Количество слов
                </Text>
                <Text
                  size="lg"
                  style={{
                    color: 'var(--theme-text)',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                  }}
                >
                  {countWords(entry.content)}
                </Text>
              </Box>

              {/* Created date */}
              <Box>
                <Text
                  size="xs"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontWeight: 400,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Дата создания
                </Text>
                <Text
                  size="sm"
                  style={{
                    color: 'var(--theme-text)',
                    fontWeight: 400,
                  }}
                >
                  {formatDate(entry.created_at)}
                </Text>
              </Box>

              {/* Mood rating */}
              {entry.mood_rating !== null && (
                <Box>
                  <Text
                    size="xs"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 400,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Настроение
                  </Text>
                  <Group gap="xs" align="center">
                    <Text
                      size="lg"
                      style={{
                        color: getMoodColor(entry.mood_rating),
                        fontWeight: 500,
                        fontFamily: 'monospace',
                      }}
                    >
                      {entry.mood_rating.toFixed(2)}
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                      }}
                    >
                      {getMoodLabel(entry.mood_rating)}
                    </Text>
                  </Group>
                </Box>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <Box>
                    <Text
                      size="xs"
                      style={{
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 400,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Теги
                    </Text>
                    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
                      {entry.tags.map((tag, idx) => {
                        const isHighlighted = shouldHighlightTag(tag, searchQuery || '')
                        return (
                          <Badge
                            key={idx}
                            variant="light"
                            radius="sm"
                            leftSection={<IconHash size={10} />}
                            onClick={() => onTagClick && onTagClick(tag)}
                            style={{
                              backgroundColor: isHighlighted ? 'var(--theme-primary)' : 'var(--theme-hover)',
                              color: isHighlighted ? 'var(--theme-bg)' : 'var(--theme-text-secondary)',
                              border: isHighlighted ? '1px solid var(--theme-primary)' : '1px solid var(--theme-border)',
                              fontWeight: isHighlighted ? 500 : 400,
                              fontSize: '11px',
                              padding: '4px 8px',
                              cursor: onTagClick ? 'pointer' : 'default',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (onTagClick && !isHighlighted) {
                                e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                                e.currentTarget.style.color = 'var(--theme-bg)'
                                e.currentTarget.style.borderColor = 'var(--theme-primary)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (onTagClick && !isHighlighted) {
                                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                                e.currentTarget.style.color = 'var(--theme-text-secondary)'
                                e.currentTarget.style.borderColor = 'var(--theme-border)'
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        )
                      })}
                    </Group>
                  </Box>
              )}

            </>
          ) : null}
        </Stack>
      </Box>
  )

  return (
    <Box
      style={{
        width: isCollapsed ? '48px' : '304px',
        height: 'calc(100vh - 64px)',
        borderLeft: '1px solid var(--theme-border)',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Collapse button */}
      <Box
        style={{
          position: 'absolute',
          top: '16px',
          left: isCollapsed ? '12px' : '-12px',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'left 0.3s ease',
        }}
        onClick={() => {
          setIsCollapsed(!isCollapsed)
        }}
      >
        <Box
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--theme-bg)',
            border: '1px solid var(--theme-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 100,
          }}
        >
          {isCollapsed ? (
            <IconChevronLeft size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          ) : (
            <IconChevronRight size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          )}
        </Box>
      </Box>

      {!isCollapsed && sidebarContent}
    </Box>
  )
}

