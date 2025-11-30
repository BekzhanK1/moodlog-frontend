import { Card, Text, Box, Group, ActionIcon, Stack, Select, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'
import { getUserTimezoneOffset } from '../../utils/timezone'

interface DataPoint {
  date: string
  mood_rating: number
  num_entries: number
}

type ViewType = 'month' | 'week' | 'year'

export function MoodTrendGraph() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>('month')
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

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
        let rawData: DataPoint[]

        const timezoneOffset = getUserTimezoneOffset()
        
        if (viewType === 'week') {
          const { start, end } = getWeekDates(currentDate)
          startDate = start.toISOString().split('T')[0]
          endDate = end.toISOString().split('T')[0]
          rawData = await apiClient.getMoodTrend(startDate, endDate, timezoneOffset)
        } else if (viewType === 'year') {
          // Запрашиваем данные за весь год
          startDate = new Date(year, 0, 1).toISOString().split('T')[0]
          endDate = new Date(year, 11, 31).toISOString().split('T')[0]
          rawData = await apiClient.getMoodTrend(startDate, endDate, timezoneOffset)
          
          // Группируем данные по месяцам и вычисляем средний рейтинг
          const monthlyData: { [key: number]: { ratings: number[]; numEntries: number } } = {}
          
          rawData.forEach((point) => {
            const date = new Date(point.date)
            const month = date.getMonth() // 0-11
            if (!monthlyData[month]) {
              monthlyData[month] = { ratings: [], numEntries: 0 }
            }
            monthlyData[month].ratings.push(point.mood_rating)
            monthlyData[month].numEntries += point.num_entries
          })
          
          // Создаем массив из 12 месяцев (всегда показываем все месяцы)
          const processedData: DataPoint[] = []
          for (let m = 0; m < 12; m++) {
            if (monthlyData[m] && monthlyData[m].ratings.length > 0) {
              const avgRating = monthlyData[m].ratings.reduce((sum, r) => sum + r, 0) / monthlyData[m].ratings.length
              processedData.push({
                date: `${year}-${String(m + 1).padStart(2, '0')}-01`, // Первое число месяца для отображения
                mood_rating: Math.round(avgRating * 100) / 100,
                num_entries: monthlyData[m].numEntries
              })
            } else {
              // Если нет данных за месяц, используем null для пропуска в графике
              // Но все равно добавляем точку для правильного масштабирования
              processedData.push({
                date: `${year}-${String(m + 1).padStart(2, '0')}-01`,
                mood_rating: 0, // Будет пропущено при рендеринге
                num_entries: 0
              })
            }
          }
          
          rawData = processedData
        } else {
          startDate = new Date(year, month, 1).toISOString().split('T')[0]
          const lastDay = new Date(year, month + 1, 0).getDate()
          endDate = new Date(year, month, lastDay).toISOString().split('T')[0]
          rawData = await apiClient.getMoodTrend(startDate, endDate, timezoneOffset)
        }
        
        setData(rawData)
        
        // Минимальная задержка для плавности
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error('Failed to fetch trend data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year, month, viewType, currentDate])

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const handlePrevious = () => {
    if (viewType === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (viewType === 'year') {
      setCurrentDate(new Date(year - 1, 0, 1))
    } else {
      setCurrentDate(new Date(year, month - 1, 1))
    }
  }

  const handleNext = () => {
    if (viewType === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (viewType === 'year') {
      const now = new Date()
      const currentYear = now.getFullYear()
      if (year < currentYear) {
        setCurrentDate(new Date(year + 1, 0, 1))
      }
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
    } else if (viewType === 'year') {
      return `${year}`
    } else {
      return `${monthNames[month]} ${year}`
    }
  }

  const isCurrentPeriod = () => {
    const now = new Date()
    if (viewType === 'year') {
      return year === now.getFullYear()
    } else if (viewType === 'week') {
      const currentISO = getWeekDates(new Date())
      const selectedISO = getWeekDates(currentDate)
      return currentISO.start.getTime() === selectedISO.start.getTime()
    } else {
      return year === now.getFullYear() && month === now.getMonth()
    }
  }

  // Границы для графика: mood_rating от -2 до 2
  const minRating = -2
  const maxRating = 2
  const padding = 50
  const chartHeight = isMobile ? 300 : 400
  const chartWidth = isMobile ? 400 : 800

  // Функция для преобразования значения в координаты
  const scaleX = (index: number, total: number) => {
    return padding + (index / (total - 1 || 1)) * (chartWidth - 2 * padding)
  }

  const scaleY = (rating: number) => {
    const normalized = (rating - minRating) / (maxRating - minRating)
    return padding + (1 - normalized) * (chartHeight - 2 * padding)
  }

  // Создание плавной кривой Безье с использованием алгоритма Catmull-Rom сплайна
  const createSmoothPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = i < points.length - 2 ? points[i + 2] : points[i + 1]

      // Вычисление контрольных точек для плавной кривой
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }

    return path
  }

  // Получение цвета для линии на основе среднего значения
  const getLineColor = (avgRating: number): string => {
    if (avgRating >= 1.0) return '#4ade80' // зеленый
    if (avgRating >= 0) return '#a3e635' // желто-зеленый
    if (avgRating >= -1.0) return '#fb923c' // оранжевый
    return '#ef4444' // красный
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
        <Stack gap="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Text
              style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 600,
                color: 'var(--theme-text)',
              }}
            >
              График настроения
            </Text>
            <Group gap="xs" wrap="nowrap">
              <Select
                value={viewType}
                onChange={(value) => setViewType(value as ViewType)}
                data={[
                  { value: 'month', label: 'Месяц' },
                  { value: 'week', label: 'Неделя' },
                  { value: 'year', label: 'Год' },
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
                disabled={isCurrentPeriod() && viewType === 'year'}
                style={{
                  color: isCurrentPeriod() && viewType === 'year' ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                  cursor: isCurrentPeriod() && viewType === 'year' ? 'not-allowed' : 'pointer',
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
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: chartHeight }}>
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

  const hasData = viewType === 'year' 
    ? data.some(p => p.num_entries > 0)
    : data.length > 0

  if (!hasData) {
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
              График настроения
            </Text>
            <Group gap="xs" wrap="nowrap">
              <Select
                value={viewType}
                onChange={(value) => setViewType(value as ViewType)}
                data={[
                  { value: 'month', label: 'Месяц' },
                  { value: 'week', label: 'Неделя' },
                  { value: 'year', label: 'Год' },
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
                disabled={isCurrentPeriod() && viewType === 'year'}
                style={{
                  color: isCurrentPeriod() && viewType === 'year' ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                  cursor: isCurrentPeriod() && viewType === 'year' ? 'not-allowed' : 'pointer',
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
          <Text style={{ color: 'var(--theme-text-secondary)', textAlign: 'center', padding: '40px 0' }}>
            Нет данных за этот период
          </Text>
        </Stack>
      </Card>
    )
  }

  // Подготовка точек для графика
  // Для годового вида используем все 12 месяцев для правильного масштабирования
  const pointsToRender = viewType === 'year' 
    ? data.filter(p => p.num_entries > 0) // Только месяцы с данными для рендеринга
    : data
  
  // Для годового вида масштабируем по 12 месяцам, для остальных - по количеству точек
  // const totalPoints = viewType === 'year' ? 12 : data.length
  
  const points = pointsToRender.map((point, index) => {
    // Для годового вида вычисляем позицию на основе месяца
    let x: number
    if (viewType === 'year') {
      const pointDate = new Date(point.date)
      const monthIndex = pointDate.getMonth() // 0-11
      x = scaleX(monthIndex, 12) // Всегда 12 месяцев
    } else {
      x = scaleX(index, pointsToRender.length)
    }
    
    return {
      x,
      y: scaleY(point.mood_rating),
      rating: point.mood_rating,
      date: point.date,
    }
  })

  const avgRating = pointsToRender.length > 0 
    ? pointsToRender.reduce((sum, p) => sum + p.mood_rating, 0) / pointsToRender.length
    : 0
  const lineColor = getLineColor(avgRating)

  // Создание области под графиком для градиента
  const areaPath = createSmoothPath(points) + 
    ` L ${points[points.length - 1].x} ${chartHeight - padding}` +
    ` L ${points[0].x} ${chartHeight - padding} Z`

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
        <Group justify="space-between" align="center">
          <Text
            style={{
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 600,
              color: 'var(--theme-text)',
            }}
          >
            График настроения
          </Text>
            <Group gap="xs" wrap="nowrap">
              <Select
                value={viewType}
                onChange={(value) => setViewType(value as ViewType)}
                data={[
                  { value: 'month', label: 'Месяц' },
                  { value: 'week', label: 'Неделя' },
                  { value: 'year', label: 'Год' },
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
                disabled={isCurrentPeriod() && viewType === 'year'}
                style={{
                  color: isCurrentPeriod() && viewType === 'year' ? 'var(--theme-text-secondary)' : 'var(--theme-text)',
                  cursor: isCurrentPeriod() && viewType === 'year' ? 'not-allowed' : 'pointer',
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

        <Box
          style={{
            width: '100%',
            height: chartHeight,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <svg
            width="100%"
            height={chartHeight}
            style={{ overflow: 'visible' }}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Градиент для области под графиком */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Сетка и оси */}
            {/* Горизонтальные линии */}
            {[-2, -1, 0, 1, 2].map((value) => {
              const y = scaleY(value)
              return (
                <g key={value}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="var(--theme-border)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.3"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    fill="var(--theme-text-secondary)"
                    fontSize="11"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {/* Область под графиком */}
            <path
              d={areaPath}
              fill="url(#areaGradient)"
            />

            {/* Линия графика */}
            <path
              d={createSmoothPath(points)}
              fill="none"
              stroke={lineColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Вертикальная линия при наведении */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <g>
                <line
                  x1={points[hoveredPoint].x}
                  y1={padding}
                  x2={points[hoveredPoint].x}
                  y2={chartHeight - padding}
                  stroke="var(--theme-text-secondary)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              </g>
            )}

            {/* Точки на графике */}
            {points.map((point, index) => (
              <g key={index}>
                {/* Увеличенная точка при наведении */}
                {hoveredPoint === index && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill={lineColor}
                    opacity="0.2"
                  />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? "6" : "4"}
                  fill={lineColor}
                  stroke="var(--theme-bg)"
                  strokeWidth="2"
                  style={{ 
                    cursor: 'pointer',
                    transition: 'r 0.2s ease',
                  }}
                />
                {/* Невидимая область для hover */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* Tooltip при наведении */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <g>
                {/* Фон tooltip */}
                <rect
                  x={points[hoveredPoint].x - 60}
                  y={points[hoveredPoint].y - 50}
                  width="120"
                  height="35"
                  rx="6"
                  fill="var(--theme-bg)"
                  stroke="var(--theme-border)"
                  strokeWidth="1"
                  opacity="0.95"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                />
                {/* Дата или месяц */}
                <text
                  x={points[hoveredPoint].x}
                  y={points[hoveredPoint].y - 30}
                  fill="var(--theme-text)"
                  fontSize="12"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {viewType === 'year' 
                    ? monthNames[new Date(points[hoveredPoint].date).getMonth()]
                    : new Date(points[hoveredPoint].date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                </text>
                {/* Mood rating */}
                <text
                  x={points[hoveredPoint].x}
                  y={points[hoveredPoint].y - 15}
                  fill="var(--theme-text-secondary)"
                  fontSize="11"
                  textAnchor="middle"
                >
                  Настроение: {points[hoveredPoint].rating.toFixed(2)}
                </text>
                {/* Стрелка */}
                <polygon
                  points={`${points[hoveredPoint].x - 6},${points[hoveredPoint].y - 15} ${points[hoveredPoint].x + 6},${points[hoveredPoint].y - 15} ${points[hoveredPoint].x},${points[hoveredPoint].y - 8}`}
                  fill="var(--theme-bg)"
                  stroke="var(--theme-border)"
                  strokeWidth="1"
                />
              </g>
            )}
          </svg>
        </Box>

        {/* Подписи осей */}
        {viewType === 'year' ? (
          <Group justify="space-between" style={{ paddingTop: '8px', fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
            <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Январь
            </Text>
            <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Декабрь
            </Text>
          </Group>
        ) : (
          <Group justify="space-between" style={{ paddingTop: '8px', fontSize: '11px', color: 'var(--theme-text-secondary)' }}>
            <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
              {pointsToRender.length > 0 && new Date(pointsToRender[0].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </Text>
            <Text size="xs" style={{ color: 'var(--theme-text-secondary)' }}>
              {pointsToRender.length > 0 && new Date(pointsToRender[pointsToRender.length - 1].date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  )
}

