import { Modal, Text, Stack, Group, Box, Button, ScrollArea, Divider } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconCalendar } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { apiClient } from '../../utils/api'

interface Insight {
  id: string
  type: string
  period_key: string
  period_label: string
  created_at: string
}

interface InsightsListModalProps {
  opened: boolean
  onClose: () => void
  type: 'weekly' | 'monthly'
  onSelect: (periodKey: string) => void
}

export function InsightsListModal({ opened, onClose, type, onSelect }: InsightsListModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (opened) {
      fetchInsights()
    }
  }, [opened, type])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const result = await apiClient.listInsights(type, 1, 100)
      // Сортируем по дате создания (новые сверху)
      const sorted = result.insights.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setInsights(sorted)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (periodKey: string) => {
    onSelect(periodKey)
    onClose()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: 'var(--theme-text)' }}>
          {type === 'weekly' ? 'Все недельные сводки' : 'Все месячные сводки'}
        </Text>
      }
      size={isMobile ? '90%' : '600px'}
      styles={{
        content: {
          backgroundColor: 'var(--theme-bg)',
        },
        header: {
          backgroundColor: 'var(--theme-bg)',
          borderBottom: '1px solid var(--theme-border)',
        },
        body: {
          backgroundColor: 'var(--theme-bg)',
        },
      }}
    >
      <Stack gap="md">
        {loading ? (
          <Box style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ color: 'var(--theme-text-secondary)' }}>Загрузка...</Text>
          </Box>
        ) : insights.length === 0 ? (
          <Box style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ color: 'var(--theme-text-secondary)' }}>
              {type === 'weekly' ? 'Нет созданных недельных сводок' : 'Нет созданных месячных сводок'}
            </Text>
          </Box>
        ) : (
          <ScrollArea style={{ height: isMobile ? '400px' : '500px' }}>
            <Stack gap="xs">
              {insights.map((insight) => (
                <Box
                  key={insight.id}
                  onClick={() => handleSelect(insight.period_key)}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--theme-hover)',
                    borderRadius: '8px',
                    border: '1px solid var(--theme-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-border)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-hover)'
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                      <Group gap="xs" align="center">
                        <IconCalendar size={16} style={{ color: 'var(--theme-primary)' }} />
                        <Text
                          style={{
                            fontSize: isMobile ? '15px' : '16px',
                            fontWeight: 600,
                            color: 'var(--theme-text)',
                          }}
                        >
                          {insight.period_label}
                        </Text>
                      </Group>
                      <Text
                        style={{
                          fontSize: isMobile ? '12px' : '13px',
                          color: 'var(--theme-text-secondary)',
                          marginLeft: '24px',
                        }}
                      >
                        Создано: {formatDate(insight.created_at)}
                      </Text>
                    </Stack>
                  </Group>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Modal>
  )
}

