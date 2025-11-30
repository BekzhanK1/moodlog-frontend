import { Card, Text, Group, ActionIcon, Box, Stack, Select, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

interface CalendarDay {
  date: string
  mood_rating: number
  num_entries: number
}

type ViewType = 'month' | 'week'

export function MoodCalendar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('month')
  const [data, setData] = useState<CalendarDay[]>([])
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Вычисление дат для недельного вида
  const getWeekDates = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Понедельник
    const monday = new Date(d.getFullYear(), d.getMonth(), diff)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    return { start: monday, end: sunday }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let startDate: string
        let endDate: string

        if (viewType === 'week') {
          const { start, end } = getWeekDates(currentDate)
          startDate = start.toISOString().split('T')[0]
          endDate = end.toISOString().split('T')[0]
        } else {
          startDate = new Date(year, month, 1).toISOString().split('T')[0]
          const lastDay = new Date(year, month + 1, 0).getDate()
          endDate = new Date(year, month, lastDay).toISOString().split('T')[0]
        }
        
        const result = await apiClient.getMoodTrend(startDate, endDate)
        setData(result)
        
        // Минимальная задержка для плавности
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year, month, viewType, currentDate])

  const getMoodColor = (rating: number | null): { bg: string; text: string; label: string } => {
    if (rating === null) return { bg: '#e5e7eb', text: '#6b7280', label: 'Нет данных' }
    // Очень позитивное (1.0 до 2.0): яркий зеленый
    if (rating >= 1.0) return { bg: '#4ade80', text: '#14532d', label: 'Очень позитивное' }
    // Позитивное (0 до 1.0): светло-зеленый/желто-зеленый
    if (rating >= 0) return { bg: '#a3e635', text: '#365314', label: 'Позитивное' }
    // Негативное (-1.0 до 0): оранжевый/красноватый
    if (rating >= -1.0) return { bg: '#fb923c', text: '#7c2d12', label: 'Негативное' }
    // Очень негативное (-2.0 до -1.0): красный
    return { bg: '#ef4444', text: '#ffffff', label: 'Очень негативное' }
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevious = () => {
    if (viewType === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(year, month - 1, 1))
    }
  }

  const handleNext = () => {
    if (viewType === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    } else {
      setCurrentDate(new Date(year, month + 1, 1))
    }
  }

  const handleCurrentPeriod = () => {
    setCurrentDate(new Date())
  }

  const getPeriodLabel = () => {
    if (viewType === 'week') {
      const { start, end } = getWeekDates(currentDate)
      const startStr = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      const endStr = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
      return `${startStr} - ${endStr}`
    } else {
      return `${monthNames[month]} ${year}`
    }
  }

  // Подготовка дней для отображения
  const days: (CalendarDay | null)[] = []
  
  if (viewType === 'week') {
    // Недельный вид: показываем только дни текущей недели
    const { start, end } = getWeekDates(currentDate)
    const current = new Date(start)
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      const dayData = data.find(d => d.date === dateStr)
      days.push(dayData || null)
      current.setDate(current.getDate() + 1)
    }
  } else {
    // Месячный вид: показываем весь месяц
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    // Add empty cells for days before the first day of the month (Sunday = 0, Monday = 1, etc.)
    // Adjusting for Monday = 0 (first day of week)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = data.find(d => d.date === dateStr)
      days.push(dayData || null)
    }
  }

  if (loading) {
    return (
      <Card
        padding={isMobile ? 'md' : 'lg'}
        radius="md"
        style={{
          backgroundColor: 'var(--theme-bg)',
          border: '1px solid var(--theme-border)',
          minHeight: '200px',
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
              Календарь настроения
            </Text>
            <Group gap="xs" wrap="nowrap">
              <Select
                value={viewType}
                onChange={(value) => setViewType(value as ViewType)}
                data={[
                  { value: 'month', label: 'Месяц' },
                  { value: 'week', label: 'Неделя' },
                ]}
                size="sm"
                style={{ width: isMobile ? '90px' : '110px' }}
                styles={{
                  input: {
                    backgroundColor: 'var(--theme-bg)',
                    color: 'var(--theme-text)',
                    border: '1px solid var(--theme-border)',
                  },
                  option: {
                    backgroundColor: 'var(--theme-bg)',
                    color: 'var(--theme-text)',
                    '&:hover': {
                      backgroundColor: 'var(--theme-hover)',
                    },
                  },
                  dropdown: {
                    backgroundColor: 'var(--theme-bg)',
                    border: '1px solid var(--theme-border)',
                  },
                }}
              />
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
                {getPeriodLabel()}
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={handleNext}
                style={{
                  color: 'var(--theme-text)',
                }}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
              <Button
                variant="subtle"
                size="sm"
                leftSection={<IconCalendar size={14} />}
                onClick={handleCurrentPeriod}
                style={{
                  color: 'var(--theme-text)',
                }}
              >
                {isMobile ? 'Сейчас' : 'Текущий'}
              </Button>
            </Group>
          </Group>
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Box
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--theme-border)',
                borderTop: '3px solid var(--theme-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </Box>
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
            Календарь настроения
          </Text>
          <Group gap="xs" wrap="nowrap">
            <Select
              value={viewType}
              onChange={(value) => setViewType(value as ViewType)}
              data={[
                { value: 'month', label: 'Месяц' },
                { value: 'week', label: 'Неделя' },
              ]}
              size="sm"
              style={{ width: isMobile ? '100px' : '120px' }}
              styles={{
                input: {
                  backgroundColor: 'var(--theme-bg)',
                  color: 'var(--theme-text)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: 'var(--theme-primary)',
                    borderWidth: '2px',
                    boxShadow: '0 0 0 3px color-mix(in srgb, var(--theme-primary) 10%, transparent)',
                  },
                  '&:hover': {
                    borderColor: 'var(--theme-primary)',
                  },
                },
                option: {
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-text)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                  '&[data-selected]': {
                    backgroundColor: 'var(--theme-hover)',
                    color: 'var(--theme-text)',
                  },
                  '&[data-hovered]': {
                    backgroundColor: 'var(--theme-hover)',
                  },
                },
                dropdown: {
                  backgroundColor: 'var(--theme-surface)',
                  border: '1px solid var(--theme-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                },
              }}
            />
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handlePrevious}
              style={{
                color: 'var(--theme-text)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                e.currentTarget.style.color = 'var(--theme-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--theme-text)'
              }}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Text style={{ color: 'var(--theme-text)', minWidth: isMobile ? '140px' : '180px', textAlign: 'center', fontSize: isMobile ? '13px' : '14px' }}>
              {getPeriodLabel()}
            </Text>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={handleNext}
              style={{
                color: 'var(--theme-text)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                e.currentTarget.style.color = 'var(--theme-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--theme-text)'
              }}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconCalendar size={14} />}
              onClick={handleCurrentPeriod}
              style={{
                color: 'var(--theme-text)',
              }}
            >
              {isMobile ? 'Сейчас' : 'Текущий'}
            </Button>
          </Group>
        </Group>

        {/* Weekday headers */}
        <Group gap="xs" style={{ marginBottom: '8px' }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
            <Box
              key={idx}
              style={{
                flex: 1,
                textAlign: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: 'var(--theme-text-secondary)',
                  fontWeight: 500,
                }}
              >
                {day}
              </Text>
            </Box>
          ))}
        </Group>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {days.map((day, index) => {
            if (viewType === 'week') {
              // Недельный вид: показываем все дни недели
              if (day === null) {
                // День без данных
                const { start } = getWeekDates(currentDate)
                const currentDay = new Date(start)
                currentDay.setDate(currentDay.getDate() + index)
                const dayNumber = currentDay.getDate()
                
                const colors = getMoodColor(null)
                return (
                  <Box
                    key={`no-data-${index}`}
                    style={{
                      aspectRatio: '1',
                      minHeight: '32px',
                      backgroundColor: colors.bg,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--theme-border)',
                      opacity: 0.5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 400,
                        color: colors.text,
                      }}
                    >
                      {dayNumber}
                    </Text>
                  </Box>
                )
              }
            } else {
              // Месячный вид: логика как раньше
              const daysInMonth = getDaysInMonth(year, month)
              const firstDay = getFirstDayOfMonth(year, month)
              const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
              
              // Empty cells before first day of month
              if (day === null && index < adjustedFirstDay) {
                return <Box key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '32px' }} />
              }

              // Day without data (gray)
              if (day === null) {
                const dayNumber = index - adjustedFirstDay + 1
                if (dayNumber > 0 && dayNumber <= daysInMonth) {
                  const colors = getMoodColor(null)
                  return (
                    <Box
                      key={`no-data-${dayNumber}`}
                      style={{
                        aspectRatio: '1',
                        minHeight: '32px',
                        backgroundColor: colors.bg,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--theme-border)',
                        opacity: 0.5,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: isMobile ? '12px' : '14px',
                          fontWeight: 400,
                          color: colors.text,
                        }}
                      >
                        {dayNumber}
                      </Text>
                    </Box>
                  )
                }
                return <Box key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '32px' }} />
              }
            }

            // Day with data
            const colors = getMoodColor(day.mood_rating)
            const dayDate = new Date(day.date)
            return (
              <Box
                key={day.date}
                style={{
                  aspectRatio: '1',
                  minHeight: '32px',
                  backgroundColor: colors.bg,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid transparent',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border)'
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.zIndex = '10'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.zIndex = '1'
                }}
                title={`${dayDate.toLocaleDateString('ru-RU', { 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}: ${colors.label} (${day.mood_rating.toFixed(2)})`}
              >
                <Text
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    fontWeight: 500,
                    color: colors.text,
                  }}
                >
                  {dayDate.getDate()}
                </Text>
              </Box>
            )
          })}
        </Box>

        {/* Legend */}
        <Box style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--theme-border)' }}>
          <Text
            style={{
              fontSize: isMobile ? '12px' : '13px',
              color: 'var(--theme-text-secondary)',
              marginBottom: '8px',
              fontWeight: 500,
            }}
          >
            Легенда:
          </Text>
          <Group gap="md" style={{ flexWrap: 'wrap' }}>
            {[
              { rating: 1.5, label: 'Очень позитивное' },
              { rating: 0.5, label: 'Позитивное' },
              { rating: -0.5, label: 'Негативное' },
              { rating: -1.5, label: 'Очень негативное' },
              { rating: null, label: 'Нет данных' },
            ].map((item, idx) => {
              const colors = getMoodColor(item.rating)
              return (
                <Group key={idx} gap="xs" align="center">
                  <Box
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: colors.bg,
                      border: '1px solid var(--theme-border)',
                      opacity: item.rating === null ? 0.5 : 1,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isMobile ? '11px' : '12px',
                      color: 'var(--theme-text-secondary)',
                    }}
                  >
                    {colors.label}
                  </Text>
                </Group>
              )
            })}
          </Group>
        </Box>
      </Stack>
    </Card>
  )
}

