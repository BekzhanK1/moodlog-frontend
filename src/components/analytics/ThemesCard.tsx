import { Card, Text, Stack, Group, Box, Progress, ActionIcon, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconBulb, IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

interface Theme {
  tag: string
  frequency: number
  relative_percentage: number
}

export function ThemesCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  
  // Состояние для текущего месяца
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        
        const result = await apiClient.getMainThemes(startDate, endDate)
        setThemes(result)
      } catch (error) {
        console.error('Failed to fetch themes data:', error)
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
        <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка...</Text>
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
            Темы и триггеры
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

        {themes.length === 0 ? (
          <Text style={{ color: 'var(--theme-text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
            Недостаточно данных для анализа тем
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: 500,
                color: 'var(--theme-text)',
                marginBottom: '8px',
              }}
            >
              Ваши главные темы в {monthNames[currentMonth - 1]}:
            </Text>

            <Stack gap="sm">
              {themes.map((theme) => (
                <Box key={theme.tag}>
                  <Group justify="space-between" align="center" mb="xs">
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: 'var(--theme-text)',
                        fontWeight: 500,
                      }}
                    >
                      #{theme.tag}
                    </Text>
                    <Text
                      style={{
                        fontSize: isMobile ? '14px' : '16px',
                        color: 'var(--theme-text-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {theme.relative_percentage}%
                    </Text>
                  </Group>
                  <Progress
                    value={theme.relative_percentage}
                    color="var(--theme-primary)"
                    size="sm"
                    radius="xs"
                    style={{
                      backgroundColor: 'var(--theme-hover)',
                    }}
                  />
                </Box>
              ))}
            </Stack>

            {/* AI Insight */}
            {themes.length >= 2 && (
              <Box
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: 'var(--theme-hover)',
                  borderRadius: '8px',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <Group gap="xs" align="flex-start" mb="xs">
                  <IconBulb size={18} style={{ color: 'var(--theme-primary)', marginTop: '2px' }} />
                  <Text
                    style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: 500,
                      color: 'var(--theme-text)',
                    }}
                  >
                    Инсайт от ИИ:
                  </Text>
                </Group>
                <Text
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    color: 'var(--theme-text-secondary)',
                    fontStyle: 'italic',
                    marginLeft: '26px',
                  }}
                >
                  «Обратите внимание на темы, которые чаще всего появляются в ваших записях. Они могут указывать на важные аспекты вашей жизни.»
                </Text>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Card>
  )
}

