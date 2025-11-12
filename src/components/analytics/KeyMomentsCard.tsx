import { Card, Text, Stack, Group, Box } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconSparkles, IconMoodSad, IconFlame } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../utils/api'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        
        const result = await apiClient.getBestAndWorstDay(startDate, endDate)
        setData(result)

        // Fetch entry content for best and worst days
        if (result.best_entry.id) {
          try {
            const bestEntry = await apiClient.getEntryById(result.best_entry.id)
            const preview = bestEntry.title || bestEntry.content.substring(0, 50) + '...'
            setBestEntryContent(preview)
          } catch (error) {
            console.error('Failed to fetch best entry content:', error)
          }
        }

        if (result.worst_entry.id) {
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
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    })
  }

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
            borderBottom: '2px solid var(--theme-primary)',
            paddingBottom: '8px',
          }}
        >
          Ключевые моменты месяца
        </Text>

        <Stack gap="md">
          {/* Brightest Day */}
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
                Самый светлый день: {formatDate(data.best_entry.created_at)}
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

          {/* Hardest Day */}
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
                Самый тяжёлый день: {formatDate(data.worst_entry.created_at)}
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

          {/* Breakthrough */}
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
        </Stack>
      </Stack>
    </Card>
  )
}

