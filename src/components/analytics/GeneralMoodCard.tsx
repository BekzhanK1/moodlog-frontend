import { Card, Text, Stack, Group } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconMoodSmile, IconArrowUp, IconArrowRight } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

export function GeneralMoodCard() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [data, setData] = useState<{
    current_mood_rating: number | null;
    previous_mood_rating: number | null;
    mood_rating_difference: number | null;
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.compareCurrentAndPreviousMonth()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch general mood data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getMoodLabel = (rating: number | null) => {
    if (rating === null) return 'Не определено'
    if (rating >= 0.5) return 'очень позитивное'
    if (rating >= 0) return 'умеренно позитивное'
    if (rating >= -0.5) return 'нейтральное'
    return 'негативное'
  }

  const getMoodColor = (rating: number | null) => {
    if (rating === null) return 'var(--theme-text-secondary)'
    if (rating >= 0.5) return '#22c55e'
    if (rating >= 0) return '#84cc16'
    if (rating >= -0.5) return '#f59e0b'
    return '#ef4444'
  }

  const currentMonth = new Date().toLocaleDateString('ru-RU', { month: 'long' })
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('ru-RU', { month: 'long' })

  if (loading || !data) {
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
      radius="md"
      style={{
        backgroundColor: 'var(--theme-bg)',
        border: '1px solid var(--theme-border)',
      }}
    >
      <Stack gap="md">
        <Text
          style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 600,
            color: 'var(--theme-text)',
          }}
        >
          Общий эмоциональный фон
        </Text>

        <Stack gap="sm">
          <Group gap="xs" align="center">
            <IconMoodSmile size={18} style={{ color: 'var(--theme-text-secondary)' }} />
            <Text style={{ color: 'var(--theme-text)', fontSize: isMobile ? '14px' : '16px' }}>
              Ваше настроение в {currentMonth}:{' '}
              <Text component="span" style={{ fontWeight: 600, color: getMoodColor(data.current_mood_rating) }}>
                {data.current_mood_rating !== null ? `+${data.current_mood_rating.toFixed(2)}` : 'N/A'} ({getMoodLabel(data.current_mood_rating)})
              </Text>
            </Text>
          </Group>

          {data.mood_rating_difference !== null && (
            <Group gap="xs" align="center">
              <Text style={{ color: 'var(--theme-text)', fontSize: isMobile ? '14px' : '16px' }}>
                Сравнение с {previousMonth}:{' '}
                {data.mood_rating_difference > 0 ? (
                  <Group gap={4} align="center" style={{ display: 'inline-flex' }}>
                    <IconArrowUp size={16} style={{ color: '#22c55e' }} />
                    <Text component="span" style={{ fontWeight: 600, color: '#22c55e' }}>
                      +{data.mood_rating_difference.toFixed(2)}
                    </Text>
                  </Group>
                ) : data.mood_rating_difference < 0 ? (
                  <Group gap={4} align="center" style={{ display: 'inline-flex' }}>
                    <IconArrowUp size={16} style={{ color: '#ef4444', transform: 'rotate(180deg)' }} />
                    <Text component="span" style={{ fontWeight: 600, color: '#ef4444' }}>
                      {data.mood_rating_difference.toFixed(2)}
                    </Text>
                  </Group>
                ) : (
                  <Text component="span" style={{ fontWeight: 600, color: 'var(--theme-text-secondary)' }}>
                    без изменений
                  </Text>
                )}
              </Text>
            </Group>
          )}

          <Group gap="xs" align="center">
            <IconArrowRight size={18} style={{ color: 'var(--theme-text-secondary)' }} />
            {(() => {
              const diff = data.mood_rating_difference;
              let message = '';

              if (diff === null) {
                message = 'Нет данных для сравнения с предыдущим месяцем.';
              } else if (diff > 1) {
                message = 'Сильный рост! Ваше настроение заметно улучшилось — вы чаще испытывали ярко-позитивные эмоции в этом месяце.';
              } else if (diff > 0.5) {
                message = 'Хороший прогресс: вы стали чаще отмечать светлые моменты и чувствовать себя лучше.';
              } else if (diff > 0.1) {
                message = 'Легкий подъём — настроение чуть улучшилось по сравнению с прошлым месяцем.';
              } else if (diff > -0.1) {
                message = 'Ваше настроение осталось примерно на том же уровне, что и в прошлом месяце.';
              } else if (diff > -0.5) {
                message = 'Есть небольшой спад: эмоциональный фон чуть снизился, но остаётся в стабильных пределах.';
              } else if (diff > -1) {
                message = 'Присутствует заметное снижение настроения. Постарайтесь уделить больше времени себе и заботе о своём благополучии.';
              } else {
                message = 'Сильное снижение — этот месяц выдался особенно сложным. Не бойтесь обратиться за поддержкой, позаботьтесь о себе.';
              }

              return (
                <Text style={{ color: 'var(--theme-text-secondary)', fontSize: isMobile ? '14px' : '16px' }}>
                  {message}
                </Text>
              );
            })()}
          </Group>
        </Stack>
      </Stack>
    </Card>
  )
}

