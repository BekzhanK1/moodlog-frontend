import { Card, Text, Stack, Group, Box, ActionIcon, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconSparkles, IconMoodSad, IconFlame, IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../utils/api'

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

interface BestWorstDay {
  best_entry: {
    id: string
    mood_rating: number
    created_at: string
    tags: string[] | null
  }
  worst_entry: {
    id: string
    mood_rating: number
    created_at: string
    tags: string[] | null
  }
}

export function KeyMomentsCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const navigate = useNavigate()
  const [data, setData] = useState<BestWorstDay | null>(null)
  const [bestEntryContent, setBestEntryContent] = useState<string | null>(null)
  const [worstEntryContent, setWorstEntryContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Состояние для текущего месяца
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setBestEntryContent(null)
      setWorstEntryContent(null)
      setData(null)
      try {
        const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        
        const result = await apiClient.getBestAndWorstDay(startDate, endDate)
        setData(result)

        // Fetch entry content for best and worst days
        if (result && result.best_entry && result.best_entry.id) {
          try {
            const bestEntry = await apiClient.getEntryById(result.best_entry.id)
            const preview = bestEntry.title || bestEntry.content.substring(0, 50) + '...'
            setBestEntryContent(preview)
          } catch (error) {
            console.error('Failed to fetch best entry content:', error)
          }
        }

        if (result && result.worst_entry && result.worst_entry.id) {
          try {
            const worstEntry = await apiClient.getEntryById(result.worst_entry.id)
            const preview = worstEntry.title || worstEntry.content.substring(0, 50) + '...'
            setWorstEntryContent(preview)
          } catch (error) {
            console.error('Failed to fetch worst entry content:', error)
          }
        }
      } catch (error) {
        console.error('Failed to fetch key moments data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
    const now = new Date()
    const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
    if (isCurrentMonth) {
      return
    }
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1)
    } else {
      setCurrentYear(currentYear + 1)
      setCurrentMonth(1)
    }
  }

  const handleCurrentMonth = () => {
    const now = new Date()
    setCurrentYear(now.getFullYear())
    setCurrentMonth(now.getMonth() + 1)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1
  }

  const getMonthLabel = () => {
    return `${monthNames[currentMonth - 1]} ${currentYear}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    })
  }

  if (loading) {
    return (
      <Card
        padding={isMobile ? 'md' : 'lg'}
        radius="lg"
        style={{
          backgroundColor: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          minHeight: '200px',
        }}
      >
        <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка...</Text>
      </Card>
    )
  }

  if (!data || !data.best_entry || !data.worst_entry) {
    return (
      <Card
        padding={isMobile ? 'md' : 'lg'}
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
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Text
              style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              Ключевые моменты месяца
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
            </Group>
          </Group>
          <Text style={{ color: 'var(--theme-text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            Нет данных за этот период
          </Text>
        </Stack>
      </Card>
    )
  }

  return (
    <Card
      padding={isMobile ? 'md' : 'lg'}
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
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap">
          <Text
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              color: 'var(--theme-text)',
            }}
          >
            Ключевые моменты месяца
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
          </Group>
        </Group>

        <Stack gap="md">
          {/* Brightest Day */}
          {data.best_entry && data.best_entry.id && (
            <Stack gap="xs">
              <Group gap="xs" align="center">
                <IconSparkles size={18} style={{ color: '#f59e0b' }} />
                <Text 
                  style={{ 
                    color: 'var(--theme-text)', 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/dashboard?entry=${data.best_entry.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-primary)'
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-text)'
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  Самый светлый день: {data.best_entry.created_at ? formatDate(data.best_entry.created_at) : 'Нет данных'}
                </Text>
              </Group>
              {bestEntryContent && (
                <Box 
                  style={{ 
                    marginLeft: '26px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/dashboard?entry=${data.best_entry.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Text
                    component="blockquote"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontSize: isMobile ? '13px' : '14px',
                      fontStyle: 'italic',
                      borderLeft: '2px solid var(--theme-primary)',
                      paddingLeft: '12px',
                      margin: 0,
                    }}
                  >
                    «{bestEntryContent}»
                  </Text>
                </Box>
              )}
            </Stack>
          )}

          {/* Hardest Day */}
          {data.worst_entry && data.worst_entry.id && (
            <Stack gap="xs">
              <Group gap="xs" align="center">
                <IconMoodSad size={18} style={{ color: '#ef4444' }} />
                <Text 
                  style={{ 
                    color: 'var(--theme-text)', 
                    fontSize: isMobile ? '14px' : '16px', 
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/dashboard?entry=${data.worst_entry.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-primary)'
                    e.currentTarget.style.textDecoration = 'underline'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-text)'
                    e.currentTarget.style.textDecoration = 'none'
                  }}
                >
                  Самый тяжёлый день: {data.worst_entry.created_at ? formatDate(data.worst_entry.created_at) : 'Нет данных'}
                </Text>
              </Group>
              {worstEntryContent && (
                <Box 
                  style={{ 
                    marginLeft: '26px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/dashboard?entry=${data.worst_entry.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Text
                    component="blockquote"
                    style={{
                      color: 'var(--theme-text-secondary)',
                      fontSize: isMobile ? '13px' : '14px',
                      fontStyle: 'italic',
                      borderLeft: '2px solid var(--theme-primary)',
                      paddingLeft: '12px',
                      margin: 0,
                    }}
                  >
                    «{worstEntryContent}»
                  </Text>
                </Box>
              )}
            </Stack>
          )}

          {/* Breakthrough */}
          {data.best_entry && data.best_entry.mood_rating !== undefined && (
            <Stack gap="xs">
              <Group gap="xs" align="center">
                <IconFlame size={18} style={{ color: '#f59e0b' }} />
                <Text style={{ color: 'var(--theme-text)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>
                  Прорыв:
                </Text>
              </Group>
              <Box style={{ marginLeft: '26px' }}>
                <Text style={{ color: 'var(--theme-text-secondary)', fontSize: isMobile ? '13px' : '14px' }}>
                  {data.best_entry.mood_rating > 0.5
                    ? 'Вы достигли очень позитивного настроения в этом месяце.'
                    : data.best_entry.mood_rating > 0
                    ? 'Вы показали улучшение настроения.'
                    : 'Вы продолжаете работать над своим эмоциональным состоянием.'}
                </Text>
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}

